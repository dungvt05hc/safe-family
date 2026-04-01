using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Data;
using SafeFamily.Api.Features.DeviceCatalog.Dtos;

namespace SafeFamily.Api.Features.DeviceCatalog;

public class DeviceCatalogService : IDeviceCatalogService
{
    private readonly AppDbContext _db;

    public DeviceCatalogService(AppDbContext db)
    {
        _db = db;
    }

    // ── Device Types ────────────────────────────────────────────────────────────

    public async Task<IReadOnlyList<CatalogItemDto>> GetDeviceTypesAsync(CancellationToken ct = default)
    {
        return await _db.DeviceCatalogDeviceTypes
            .Where(dt => dt.IsActive)
            .OrderBy(dt => dt.SortOrder).ThenBy(dt => dt.Name)
            .Select(dt => new CatalogItemDto(dt.Id, dt.Code, dt.Name))
            .ToListAsync(ct);
    }

    // ── Brands ──────────────────────────────────────────────────────────────────

    public async Task<IReadOnlyList<CatalogItemDto>> GetBrandsAsync(
        string? deviceTypeCode, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(deviceTypeCode))
        {
            // Return all active brands when no device type filter is applied.
            return await _db.DeviceCatalogBrands
                .Where(b => b.IsActive)
                .OrderBy(b => b.SortOrder).ThenBy(b => b.Name)
                .Select(b => new CatalogItemDto(b.Id, b.Code, b.Name))
                .ToListAsync(ct);
        }

        // Only brands that have at least one active model under the given device type.
        return await _db.DeviceCatalogModels
            .Where(m => m.IsActive
                && m.DeviceType.Code == deviceTypeCode
                && m.Brand.IsActive)
            .Select(m => m.Brand)
            .Distinct()
            .OrderBy(b => b.SortOrder).ThenBy(b => b.Name)
            .Select(b => new CatalogItemDto(b.Id, b.Code, b.Name))
            .ToListAsync(ct);
    }

    // ── Models ──────────────────────────────────────────────────────────────────

    public async Task<IReadOnlyList<CatalogModelDto>> GetModelsAsync(
        string? deviceTypeCode, string? brandCode, CancellationToken ct = default)
    {
        var q = _db.DeviceCatalogModels
            .Where(m => m.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(deviceTypeCode))
            q = q.Where(m => m.DeviceType.Code == deviceTypeCode);

        if (!string.IsNullOrWhiteSpace(brandCode))
            q = q.Where(m => m.Brand.Code == brandCode);

        return await q
            .OrderBy(m => m.SortOrder).ThenBy(m => m.Name)
            .Select(m => new CatalogModelDto(
                m.Id,
                m.Code,
                m.Name,
                m.DefaultOsFamilyId,
                m.DefaultOsFamily != null ? m.DefaultOsFamily.Code : null))
            .ToListAsync(ct);
    }

    // ── OS Families ─────────────────────────────────────────────────────────────

    public async Task<IReadOnlyList<CatalogItemDto>> GetOsFamiliesAsync(
        string? modelCode, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(modelCode))
        {
            // No model context — return all active OS families.
            return await _db.DeviceCatalogOsFamilies
                .Where(o => o.IsActive)
                .OrderBy(o => o.SortOrder).ThenBy(o => o.Name)
                .Select(o => new CatalogItemDto(o.Id, o.Code, o.Name))
                .ToListAsync(ct);
        }

        // Look up the model's default OS family first.
        var model = await _db.DeviceCatalogModels
            .AsNoTracking()
            .Where(m => m.Code == modelCode && m.IsActive)
            .Select(m => new { m.DefaultOsFamilyId })
            .FirstOrDefaultAsync(ct);

        if (model?.DefaultOsFamilyId is null)
        {
            // Model has no default — return all active OS families.
            return await _db.DeviceCatalogOsFamilies
                .Where(o => o.IsActive)
                .OrderBy(o => o.SortOrder).ThenBy(o => o.Name)
                .Select(o => new CatalogItemDto(o.Id, o.Code, o.Name))
                .ToListAsync(ct);
        }

        // Return the default family first, then the rest — so the frontend can
        // auto-select but still allow override.
        return await _db.DeviceCatalogOsFamilies
            .Where(o => o.IsActive)
            .OrderByDescending(o => o.Id == model.DefaultOsFamilyId)
            .ThenBy(o => o.SortOrder).ThenBy(o => o.Name)
            .Select(o => new CatalogItemDto(o.Id, o.Code, o.Name))
            .ToListAsync(ct);
    }

    // ── OS Versions ─────────────────────────────────────────────────────────────

    public async Task<IReadOnlyList<CatalogItemDto>> GetOsVersionsAsync(
        string osFamilyCode, CancellationToken ct = default)
    {
        return await _db.DeviceCatalogOsVersions
            .Where(v => v.IsActive && v.OsFamily.Code == osFamilyCode)
            .OrderBy(v => v.SortOrder).ThenBy(v => v.Name)
            .Select(v => new CatalogItemDto(v.Id, v.Code, v.Name))
            .ToListAsync(ct);
    }

    // ── Form Options (convenience) ──────────────────────────────────────────────

    public async Task<CatalogFormOptionsDto> GetFormOptionsAsync(
        string? deviceTypeCode, string? brandCode, string? modelCode,
        CancellationToken ct = default)
    {
        // Execute independent queries in parallel for better performance.
        var deviceTypesTask = GetDeviceTypesAsync(ct);
        var brandsTask = GetBrandsAsync(deviceTypeCode, ct);
        var modelsTask = GetModelsAsync(deviceTypeCode, brandCode, ct);

        await Task.WhenAll(deviceTypesTask, brandsTask, modelsTask);

        // OS families depend on model, OS versions depend on OS family — sequential.
        var osFamilies = await GetOsFamiliesAsync(modelCode, ct);

        // If a model code was supplied and it has a default OS family, fetch its versions.
        IReadOnlyList<CatalogItemDto> osVersions = [];
        if (osFamilies.Count > 0)
        {
            // Use the first OS family (which is either the default or the first sorted family).
            var primaryOsCode = modelCode is not null ? osFamilies[0].Code : null;
            if (primaryOsCode is not null)
                osVersions = await GetOsVersionsAsync(primaryOsCode, ct);
        }

        return new CatalogFormOptionsDto
        {
            DeviceTypes = deviceTypesTask.Result,
            Brands = brandsTask.Result,
            Models = modelsTask.Result,
            OsFamilies = osFamilies,
            OsVersions = osVersions,
        };
    }
}
