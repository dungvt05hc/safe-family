namespace SafeFamily.Api.Domain.Users;

public enum UserStatus
{
    Active      = 0,
    Suspended   = 1,
    Deactivated = 2,
    /// <summary>Temporarily locked by an admin. Distinct from Suspended (soft-policy) and Deactivated (terminal).</summary>
    Locked      = 3,
}
