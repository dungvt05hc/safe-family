using SafeFamily.Api.Domain.Common;

namespace SafeFamily.Api.Domain.Users;

/// <summary>
/// Represents an authenticated user of the SafeFamily application.
/// Extends BaseEntity (not AuditableEntity) because users create themselves —
/// there is no meaningful "created by" before the first user exists.
/// </summary>
public class User : BaseEntity
{
    /// <summary>Normalized lowercase email — unique across the system.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>The display name shown in the UI.</summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>Optional contact phone number.</summary>
    public string? Phone { get; set; }

    /// <summary>BCrypt/PBKDF2 hash produced by ASP.NET Core's PasswordHasher.</summary>
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>Application-level role. Defaults to User; set to Admin for staff accounts.</summary>
    public UserRole Role { get; set; } = UserRole.User;

    /// <summary>Account lifecycle status (active / suspended / deactivated).</summary>
    public UserStatus Status { get; set; } = UserStatus.Active;

    /// <summary>Whether the user has verified their email address.</summary>
    public bool EmailVerified { get; set; } = false;

    /// <summary>UTC timestamp of the user's most recent successful sign-in. Null until first login.</summary>
    public DateTimeOffset? LastLoginAt { get; set; }

    /// <summary>Single-use short-lived token for admin-triggered password resets. Null when none is pending.</summary>
    public string? PasswordResetToken { get; set; }

    /// <summary>UTC expiry for the pending password reset token.</summary>
    public DateTimeOffset? PasswordResetExpiresAt { get; set; }
}
