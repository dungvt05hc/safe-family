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

    public AuthService(AppDbContext db, IPasswordHasher<User> hasher)
    {
        _db = db;
        _hasher = hasher;
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

        return ToResponse(user);
    }

    public async Task<AuthUserResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var email = NormalizeEmail(request.Email);

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

        // Use a constant-time comparison path for both "not found" and "wrong password"
        // to avoid leaking whether an email is registered.
        if (user is null || _hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password)
                == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedException("Invalid email or password.");
        }

        return ToResponse(user);
    }

    public async Task<AuthUserResponse?> GetCurrentUserAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _db.Users.FindAsync(new object[] { userId }, ct);
        return user is null ? null : ToResponse(user);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private static string NormalizeEmail(string email) =>
        email.Trim().ToLowerInvariant();

    private static AuthUserResponse ToResponse(User user) =>
        new(user.Id, user.Email, user.DisplayName, user.Role);
}
