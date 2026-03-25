using SafeFamily.Api.Domain.Common;
using SafeFamily.Api.Domain.Users;

namespace SafeFamily.Api.Domain.Settings;

/// <summary>
/// Stores per-user notification preferences. One row per user, created on first access.
/// </summary>
public class UserSettings : BaseEntity
{
    public Guid UserId { get; set; }

    public bool EmailNotificationsEnabled { get; set; } = true;
    public bool BookingUpdatesEnabled { get; set; } = true;
    public bool IncidentAlertsEnabled { get; set; } = true;
    public bool ReminderNotificationsEnabled { get; set; } = true;

    // ── Navigation ─────────────────────────────────────────────────────────────
    public User User { get; set; } = null!;
}
