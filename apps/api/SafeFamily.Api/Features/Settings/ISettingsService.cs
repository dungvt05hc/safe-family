using SafeFamily.Api.Features.Settings.Dtos;

namespace SafeFamily.Api.Features.Settings;

public interface ISettingsService
{
    /// <summary>Returns the full settings bundle (profile + notifications) for the authenticated user.</summary>
    Task<SettingsResponse> GetSettingsAsync(Guid userId, CancellationToken ct = default);

    /// <summary>Updates the user's display name and phone number.</summary>
    Task<ProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken ct = default);

    /// <summary>Persists the user's notification preferences.</summary>
    Task<NotificationSettingsDto> UpdateNotificationsAsync(
        Guid userId, UpdateNotificationSettingsRequest request, CancellationToken ct = default);

    /// <summary>Verifies current password and sets a new one.</summary>
    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct = default);

    /// <summary>Registers a data-export request for the user (MVP placeholder).</summary>
    Task<PrivacyActionResponse> RequestDataExportAsync(Guid userId, CancellationToken ct = default);

    /// <summary>Registers an account-deletion request for the user (MVP placeholder).</summary>
    Task<PrivacyActionResponse> RequestAccountDeletionAsync(Guid userId, CancellationToken ct = default);
}
