using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SafeFamily.Api.Features.DeviceCatalog.Dtos;

namespace SafeFamily.Api.Features.DeviceCatalog;

[ApiController]
[Route("api/device-catalog")]
[Authorize]
public class DeviceCatalogController : ControllerBase
{
    private readonly IDeviceCatalogService _catalogService;

    public DeviceCatalogController(IDeviceCatalogService catalogService)
    {
        _catalogService = catalogService;
    }

    /// <summary>
    /// All active device type categories (Smartphone, Tablet, Laptop, …).
    /// </summary>
    [HttpGet("device-types")]
    [ProducesResponseType(typeof(IReadOnlyList<CatalogItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDeviceTypes(CancellationToken ct)
    {
        var items = await _catalogService.GetDeviceTypesAsync(ct);
        return Ok(items);
    }

    /// <summary>
    /// Brands — optionally filtered to those that have models under a given device type.
    /// </summary>
    [HttpGet("brands")]
    [ProducesResponseType(typeof(IReadOnlyList<CatalogItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBrands(
        [FromQuery] string? deviceTypeCode, CancellationToken ct)
    {
        var items = await _catalogService.GetBrandsAsync(deviceTypeCode, ct);
        return Ok(items);
    }

    /// <summary>
    /// Models — optionally filtered by device type and/or brand.
    /// Includes default OS family info so the frontend can auto-select the OS dropdown.
    /// </summary>
    [HttpGet("models")]
    [ProducesResponseType(typeof(IReadOnlyList<CatalogModelDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetModels(
        [FromQuery] string? deviceTypeCode,
        [FromQuery] string? brandCode,
        CancellationToken ct)
    {
        var items = await _catalogService.GetModelsAsync(deviceTypeCode, brandCode, ct);
        return Ok(items);
    }

    /// <summary>
    /// OS families — optionally scoped by model (returns the model's default OS first).
    /// </summary>
    [HttpGet("os-families")]
    [ProducesResponseType(typeof(IReadOnlyList<CatalogItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOsFamilies(
        [FromQuery] string? modelCode, CancellationToken ct)
    {
        var items = await _catalogService.GetOsFamiliesAsync(modelCode, ct);
        return Ok(items);
    }

    /// <summary>
    /// OS versions belonging to a specific OS family.
    /// </summary>
    [HttpGet("os-versions")]
    [ProducesResponseType(typeof(IReadOnlyList<CatalogItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetOsVersions(
        [FromQuery] string? osFamilyCode, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(osFamilyCode))
            return BadRequest(new { error = "osFamilyCode is required." });

        var items = await _catalogService.GetOsVersionsAsync(osFamilyCode, ct);
        return Ok(items);
    }

    /// <summary>
    /// Convenience endpoint that returns multiple catalog lists in a single call.
    /// Useful for initialising the entire Add/Edit Device form at once.
    /// </summary>
    [HttpGet("form-options")]
    [ProducesResponseType(typeof(CatalogFormOptionsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFormOptions(
        [FromQuery] string? deviceTypeCode,
        [FromQuery] string? brandCode,
        [FromQuery] string? modelCode,
        CancellationToken ct)
    {
        var options = await _catalogService.GetFormOptionsAsync(
            deviceTypeCode, brandCode, modelCode, ct);
        return Ok(options);
    }
}
