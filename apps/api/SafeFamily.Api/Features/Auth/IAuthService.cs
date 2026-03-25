using SafeFamily.Api.Features.Auth.Dtos;

namespace SafeFamily.Api.Features.Auth;

public interface IAuthService
{
    /// <summary>
    /// Creates a new user account. Throws <see cref="ConflictException"/> if the email is already taken.
    /// </summary>
    Task<AuthUserResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default);

    /// <summary>
    /// Validates credentials. Throws <see cref="UnauthorizedException"/> on bad email/password.
    /// </summary>
    Task<AuthUserResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);

    /// <summary>
    /// Returns the user for an authenticated session, or null if the account no longer exists.
    /// </summary>
    Task<AuthUserResponse?> GetCurrentUserAsync(Guid userId, CancellationToken ct = default);
}
