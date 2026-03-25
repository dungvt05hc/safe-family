using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SafeFamily.Api.Features.Settings.Dtos;

namespace SafeFamily.Api.Features.Settings;

[ApiController]
[Route("api/settings")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;

    public SettingsController(ISettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    // GET /api/settings
    [HttpGet]
    [ProducesResponseType(typeof(SettingsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSettings(CancellationToken ct)
    {
        var settings = await _settingsService.GetSettingsAsync(GetUserId(), ct);
        return Ok(settings);
    }

    // PUT /api/settings/profile
    [HttpPut("profile")]
    [ProducesResponseType(typeof(ProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateProfileRequest request,
        CancellationToken ct)
    {
        var profile = await _settingsService.UpdateProfileAsync(GetUserId(), request, ct);
        return Ok(profile);
    }

    // PUT /api/settings/notifications
    [HttpPut("notifications")]
    [ProducesResponseType(typeof(NotificationSettingsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateNotifications(
        [FromBody] UpdateNotificationSettingsRequest request,
        CancellationToken ct)
    {
        var notifications = await _settingsService.UpdateNotificationsAsync(GetUserId(), request, ct);
        return Ok(notifications);
    }

    // POST /api/settings/change-password
    [HttpPost("change-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequest request,
        CancellationToken ct)
    {
        await _settingsService.ChangePasswordAsync(GetUserId(), request, ct);
        return NoContent();
    }

    // POST /api/settings/request-data-export
    [HttpPost("request-data-export")]
    [ProducesResponseType(typeof(PrivacyActionResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> RequestDataExport(CancellationToken ct)
    {
        var result = await _settingsService.RequestDataExportAsync(GetUserId(), ct);
        return Ok(result);
    }

    // POST /api/settings/request-account-deletion
    [HttpPost("request-account-deletion")]
    [ProducesResponseType(typeof(PrivacyActionResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> RequestAccountDeletion(CancellationToken ct)
    {
        var result = await _settingsService.RequestAccountDeletionAsync(GetUserId(), ct);
        return Ok(result);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
