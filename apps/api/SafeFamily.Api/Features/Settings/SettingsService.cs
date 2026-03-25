using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Settings;
using SafeFamily.Api.Domain.Users;
using SafeFamily.Api.Features.Settings.Dtos;
using SafeFamily.Api.Features.Settings.Validators;

namespace SafeFamily.Api.Features.Settings;

public class SettingsService : ISettingsService
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasher<User> _hasher;

    public SettingsService(AppDbContext db, IPasswordHasher<User> hasher)
    {
        _db = db;
        _hasher = hasher;
    }

    /// <inheritdoc />
    public async Task<SettingsResponse> GetSettingsAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await RequireUserAsync(userId, ct);
        var settings = await GetOrCreateSettingsAsync(userId, ct);

        return new SettingsResponse(
            ToProfileDto(user),
            ToNotificationDto(settings));
    }

    /// <inheritdoc />
    public async Task<ProfileDto> UpdateProfileAsync(
        Guid userId, UpdateProfileRequest request, CancellationToken ct = default)
    {
        SettingsValidators.ValidateUpdateProfile(request);

        var user = await RequireUserAsync(userId, ct);

        user.DisplayName = request.FullName.Trim();
        user.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();

        await _db.SaveChangesAsync(ct);
        return ToProfileDto(user);
    }

    /// <inheritdoc />
    public async Task<NotificationSettingsDto> UpdateNotificationsAsync(
        Guid userId, UpdateNotificationSettingsRequest request, CancellationToken ct = default)
    {
        var settings = await GetOrCreateSettingsAsync(userId, ct);

        settings.EmailNotificationsEnabled    = request.EmailNotificationsEnabled;
        settings.BookingUpdatesEnabled        = request.BookingUpdatesEnabled;
        settings.IncidentAlertsEnabled        = request.IncidentAlertsEnabled;
        settings.ReminderNotificationsEnabled = request.ReminderNotificationsEnabled;

        await _db.SaveChangesAsync(ct);
        return ToNotificationDto(settings);
    }

    /// <inheritdoc />
    public async Task ChangePasswordAsync(
        Guid userId, ChangePasswordRequest request, CancellationToken ct = default)
    {
        SettingsValidators.ValidateChangePassword(request);

        var user = await RequireUserAsync(userId, ct);

        var verifyResult = _hasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);
        if (verifyResult == PasswordVerificationResult.Failed)
            throw new AppException("Current password is incorrect.", 400);

        user.PasswordHash = _hasher.HashPassword(user, request.NewPassword);
        await _db.SaveChangesAsync(ct);
    }

    /// <inheritdoc />
    public Task<PrivacyActionResponse> RequestDataExportAsync(
        Guid userId, CancellationToken ct = default)
    {
        // MVP placeholder — in a full implementation this would queue an export job.
        var response = new PrivacyActionResponse(
            "Your data export request has been received. You will receive an email with your data within 72 hours.",
            DateTimeOffset.UtcNow);

        return Task.FromResult(response);
    }

    /// <inheritdoc />
    public Task<PrivacyActionResponse> RequestAccountDeletionAsync(
        Guid userId, CancellationToken ct = default)
    {
        // MVP placeholder — in a full implementation this would initiate a deletion workflow.
        var response = new PrivacyActionResponse(
            "Your account deletion request has been received. Your account will be permanently deleted within 30 days.",
            DateTimeOffset.UtcNow);

        return Task.FromResult(response);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private async Task<User> RequireUserAsync(Guid userId, CancellationToken ct)
    {
        var user = await _db.Users.FindAsync(new object[] { userId }, ct);
        return user ?? throw new NotFoundException("User", userId);
    }

    private async Task<UserSettings> GetOrCreateSettingsAsync(Guid userId, CancellationToken ct)
    {
        var settings = await _db.UserSettings
            .FirstOrDefaultAsync(s => s.UserId == userId, ct);

        if (settings is null)
        {
            settings = new UserSettings { UserId = userId };
            _db.UserSettings.Add(settings);
            await _db.SaveChangesAsync(ct);
        }

        return settings;
    }

    private static ProfileDto ToProfileDto(User user) =>
        new(user.Id, user.DisplayName, user.Email, user.Phone);

    private static NotificationSettingsDto ToNotificationDto(UserSettings s) =>
        new(s.EmailNotificationsEnabled,
            s.BookingUpdatesEnabled,
            s.IncidentAlertsEnabled,
            s.ReminderNotificationsEnabled);
}
