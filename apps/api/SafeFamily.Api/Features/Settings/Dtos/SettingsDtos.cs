namespace SafeFamily.Api.Features.Settings.Dtos;

// ── GET /api/settings ─────────────────────────────────────────────────────────

public record SettingsResponse(
    ProfileDto Profile,
    NotificationSettingsDto Notifications);

public record ProfileDto(
    Guid Id,
    string FullName,
    string Email,
    string? Phone);

public record NotificationSettingsDto(
    bool EmailNotificationsEnabled,
    bool BookingUpdatesEnabled,
    bool IncidentAlertsEnabled,
    bool ReminderNotificationsEnabled);

// ── PUT /api/settings/profile ─────────────────────────────────────────────────

public record UpdateProfileRequest(
    string FullName,
    string? Phone);

// ── PUT /api/settings/notifications ──────────────────────────────────────────

public record UpdateNotificationSettingsRequest(
    bool EmailNotificationsEnabled,
    bool BookingUpdatesEnabled,
    bool IncidentAlertsEnabled,
    bool ReminderNotificationsEnabled);

// ── POST /api/settings/change-password ───────────────────────────────────────

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword,
    string ConfirmNewPassword);

// ── Privacy actions ───────────────────────────────────────────────────────────

public record PrivacyActionResponse(
    string Message,
    DateTimeOffset RequestedAt);
