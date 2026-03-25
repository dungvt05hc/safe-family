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
}
