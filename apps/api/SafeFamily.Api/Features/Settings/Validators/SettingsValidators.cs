using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Features.Settings.Dtos;

namespace SafeFamily.Api.Features.Settings.Validators;

/// <summary>
/// Static validation helpers for settings requests.
/// Throws <see cref="AppException"/> (HTTP 400) on invalid input.
/// </summary>
public static class SettingsValidators
{
    public static void ValidateUpdateProfile(UpdateProfileRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName))
            throw new AppException("Full name is required.");

        if (request.FullName.Trim().Length > 200)
            throw new AppException("Full name must not exceed 200 characters.");

        if (request.Phone is not null && request.Phone.Trim().Length > 30)
            throw new AppException("Phone number must not exceed 30 characters.");
    }

    public static void ValidateChangePassword(ChangePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword))
            throw new AppException("Current password is required.");

        if (string.IsNullOrWhiteSpace(request.NewPassword))
            throw new AppException("New password is required.");

        if (request.NewPassword.Length < 8)
            throw new AppException("New password must be at least 8 characters long.");

        if (request.NewPassword != request.ConfirmNewPassword)
            throw new AppException("New password and confirmation do not match.");

        if (request.CurrentPassword == request.NewPassword)
            throw new AppException("New password must differ from the current password.");
    }
}
