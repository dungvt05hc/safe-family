using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Users;
using SafeFamily.Api.Features.Auth.Dtos;

namespace SafeFamily.Api.Features.Auth;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasher<User> _hasher;
    private readonly IExternalTokenVerifierRegistry _verifiers;

    public AuthService(AppDbContext db, IPasswordHasher<User> hasher, IExternalTokenVerifierRegistry verifiers)
    {
        _db = db;
        _hasher = hasher;
        _verifiers = verifiers;
    }

    public async Task<AuthUserResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var email = NormalizeEmail(request.Email);

        var exists = await _db.Users.AnyAsync(u => u.Email == email, ct);
        if (exists)
            throw new ConflictException("An account with this email already exists.");

        var user = new User
        {
            Email = email,
            DisplayName = request.DisplayName.Trim(),
        };

        user.PasswordHash = _hasher.HashPassword(user, request.Password);

        await _db.Users.AddAsync(user, ct);
        await _db.SaveChangesAsync(ct);

        return ToResponse(user) with { IsNewUser = true };
    }

    public async Task<AuthUserResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var email = NormalizeEmail(request.Email);

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

        // Use a constant-time comparison path for both "not found" and "wrong password"
        // to avoid leaking whether an email is registered.
        // PasswordHash can be null for social-only accounts — treat that as a failed attempt.
        if (user is null
            || user.PasswordHash is null
            || _hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password)
                == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedException("Invalid email or password.");
        }

        if (user.Status != UserStatus.Active)
        {
            throw new UnauthorizedException("Invalid email or password.");
        }

        return ToResponse(user);
    }

    public async Task<AuthUserResponse?> GetCurrentUserAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _db.Users.FindAsync(new object[] { userId }, ct);
        if (user is null)
            return null;

        // Re-validate status on every authenticated request so a suspension takes
        // effect immediately without waiting for the 7-day cookie to expire.
        if (user.Status != UserStatus.Active)
            return null;

        return ToResponse(user);
    }

    public async Task<AuthUserResponse> ExternalLoginAsync(ExternalAuthRequest request, CancellationToken ct = default)
    {
        // 1. Resolve the correct verifier — throws if the provider is not registered.
        var verifier = _verifiers.GetVerifier(request.Provider)
            ?? throw new UnauthorizedException($"Identity provider '{request.Provider}' is not supported.");

        // Canonical casing comes from the verifier's ProviderName, not the client-supplied string.
        var provider = verifier.ProviderName;

        // 2. Verify the ID token server-side — rejects tampered or expired tokens.
        var identity = await verifier.VerifyAsync(request.IdToken, ct);
        if (identity is null)
            throw new UnauthorizedException($"The {provider} ID token could not be verified.");

        var email = NormalizeEmail(identity.Email);

        // 2. Look up the provider linkage by (Provider, ProviderSubject).
        //    ProviderSubject is the stable "sub" claim — never changes for the account lifetime.
        var externalLogin = await _db.UserExternalLogins
            .Include(x => x.User)
            .FirstOrDefaultAsync(
                x => x.Provider == provider && x.ProviderSubject == identity.Subject, ct);

        User user;
        bool isNewUser;

        if (externalLogin is not null)
        {
            // Fast path — returning user already linked.
            user = externalLogin.User;
            isNewUser = false;

            // Check status here so a suspension takes effect immediately even with
            // an existing link, without touching the database first.
            if (user.Status != UserStatus.Active)
                throw new UnauthorizedException("This account has been suspended.");
        }
        else
        {
            // 3. Fallback: find by email — could be an existing email/password account.
            //    Link the provider so subsequent sign-ins use the fast path.
            var existing = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

            if (existing is not null)
            {
                // Guard BEFORE writing — do not commit a link for a suspended account.
                if (existing.Status != UserStatus.Active)
                    throw new UnauthorizedException("This account has been suspended.");

                // Only auto-link when the provider has verified the email address.
                // Providers that cannot guarantee verification must go through explicit
                // user-initiated linking instead.
                if (!identity.EmailVerified)
                    throw new ConflictException(
                        "An account with this email already exists. " +
                        "Sign in with your password to link this provider from your account settings.");

                user = existing;
                isNewUser = false;
                _db.UserExternalLogins.Add(new UserExternalLogin
                {
                    UserId          = user.Id,
                    Provider        = provider,
                    ProviderSubject = identity.Subject,
                    ProviderEmail   = email,
                });
                await _db.SaveChangesAsync(ct);
            }
            else
            {
                // 4. Auto-register: first time this external account is seen.
                //    Create the User and ExternalLogin in the same transaction.
                var displayName = identity.Name?.Trim() is { Length: > 0 } n ? n : email.Split('@')[0];

                user = new User
                {
                    Email         = email,
                    DisplayName   = displayName,
                    EmailVerified = true,   // Provider has verified ownership of this email.
                    // PasswordHash intentionally left null — social-only account.
                };

                _db.Users.Add(user);
                _db.UserExternalLogins.Add(new UserExternalLogin
                {
                    UserId          = user.Id,   // Guid already assigned by BaseEntity initializer
                    Provider        = provider,
                    ProviderSubject = identity.Subject,
                    ProviderEmail   = email,
                });

                try
                {
                    await _db.SaveChangesAsync(ct);
                    isNewUser = true;
                }
                catch (DbUpdateException ex)
                    when (ex.InnerException?.Message.Contains("23505") == true     // Npgsql unique violation
                       || ex.InnerException?.Message.Contains("unique", StringComparison.OrdinalIgnoreCase) == true)
                {
                    // Two concurrent first-time logins for the same external account both passed the
                    // "externalLogin is null" check before either committed. The second save hits the
                    // unique (provider, subject) index. Re-query for the winning row and continue.
                    _db.ChangeTracker.Clear();
                    var concurrent = await _db.UserExternalLogins
                        .Include(x => x.User)
                        .FirstOrDefaultAsync(x => x.Provider == provider && x.ProviderSubject == identity.Subject, ct);
                    if (concurrent is null) throw; // Unexpected — rethrow the original exception.
                    user = concurrent.User;
                    isNewUser = false;
                }
            }
        }

        // 5. Guard against suspended accounts on paths not already checked
        //    (auto-registered users are always Active; this is a safety net for future paths).
        if (user.Status != UserStatus.Active)
            throw new UnauthorizedException("This account has been suspended.");

        return ToResponse(user) with { IsNewUser = isNewUser };
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private static string NormalizeEmail(string email) =>
        email.Trim().ToLowerInvariant();

    private static AuthUserResponse ToResponse(User user) =>
        new(user.Id, user.Email, user.DisplayName, user.Role);
}
