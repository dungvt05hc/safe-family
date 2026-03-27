using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SafeFamily.Api.Features.Devices.Dtos;

namespace SafeFamily.Api.Features.Devices;

[ApiController]
[Route("api/devices")]
[Authorize]
public class DevicesController : ControllerBase
{
    private readonly IDeviceService _deviceService;

    public DevicesController(IDeviceService deviceService)
    {
        _deviceService = deviceService;
    }

    // GET /api/devices/summary
    [HttpGet("summary")]
    [ProducesResponseType(typeof(DeviceSummaryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetSummary(CancellationToken ct)
    {
        var userId = GetUserId();
        var summary = await _deviceService.GetSummaryAsync(userId, ct);
        return Ok(summary);
    }

    // GET /api/devices
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<DeviceResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetDevices([FromQuery] DeviceQuery query, CancellationToken ct)
    {
        var userId = GetUserId();
        var devices = await _deviceService.GetDevicesAsync(userId, query, ct);
        return Ok(devices);
    }

    // GET /api/devices/{id}
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(DeviceResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDevice(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();
        var device = await _deviceService.GetDeviceByIdAsync(userId, id, ct);

        if (device is null)
            return NotFound();

        return Ok(device);
    }

    // POST /api/devices
    [HttpPost]
    [ProducesResponseType(typeof(DeviceResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateDevice([FromBody] CreateDeviceRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        var device = await _deviceService.CreateDeviceAsync(userId, request, ct);
        return CreatedAtAction(nameof(GetDevice), new { id = device.Id }, device);
    }

    // PUT /api/devices/{id}
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(DeviceResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateDevice(Guid id, [FromBody] UpdateDeviceRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        var device = await _deviceService.UpdateDeviceAsync(userId, id, request, ct);

        if (device is null)
            return NotFound();

        return Ok(device);
    }

    // DELETE /api/devices/{id}
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ArchiveDevice(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();
        var archived = await _deviceService.ArchiveDeviceAsync(userId, id, ct);

        if (!archived)
            return NotFound();

        return NoContent();
    }

    private Guid GetUserId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("User ID claim is missing.");
        return Guid.Parse(raw);
    }
}
