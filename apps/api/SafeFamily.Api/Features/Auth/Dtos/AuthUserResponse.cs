using SafeFamily.Api.Domain.Users;

namespace SafeFamily.Api.Features.Auth.Dtos;

/// <summary>
/// Returned from all auth endpoints. Never exposes the password hash.
/// </summary>
public record AuthUserResponse(Guid Id, string Email, string DisplayName, UserRole Role)
{
    /// <summary>
    /// True when this response was produced by creating a brand-new account
    /// (e.g. first-time Google sign-in). Always false for email/password flows.
    ///
    /// The frontend uses this signal to route new users to the family-onboarding
    /// wizard rather than sending them straight to the dashboard.
    /// </summary>
    public bool IsNewUser { get; init; } = false;
}
