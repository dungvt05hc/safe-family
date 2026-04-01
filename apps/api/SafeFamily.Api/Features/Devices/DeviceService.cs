using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Devices;
using SafeFamily.Api.Features.Devices.Dtos;

namespace SafeFamily.Api.Features.Devices;

public class DeviceService : IDeviceService
{
    private readonly AppDbContext _db;

    public DeviceService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<DeviceResponse>> GetDevicesAsync(Guid userId, DeviceQuery query, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var q = _db.Devices
            .Include(d => d.CatalogDeviceType)
            .Include(d => d.CatalogBrand)
            .Include(d => d.CatalogModel)
            .Include(d => d.CatalogOsFamily)
            .Include(d => d.CatalogOsVersion)
            .Where(d => d.FamilyId == familyId && d.ArchivedAt == null)
            .AsQueryable();

        if (query.MemberId.HasValue)
            q = q.Where(d => d.MemberId == query.MemberId.Value);

        if (!string.IsNullOrWhiteSpace(query.DeviceTypeCode))
            q = q.Where(d => d.CatalogDeviceType != null && d.CatalogDeviceType.Code == query.DeviceTypeCode);

        if (query.SupportStatus.HasValue)
            q = q.Where(d => d.SupportStatus == query.SupportStatus.Value);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(d =>
                (d.CatalogBrand != null && d.CatalogBrand.Name.ToLower().Contains(term)) ||
                (d.CatalogModel != null && d.CatalogModel.Name.ToLower().Contains(term)) ||
                (d.CatalogOsFamily != null && d.CatalogOsFamily.Name.ToLower().Contains(term)) ||
                (d.Notes != null && d.Notes.ToLower().Contains(term)));
        }

        return await q
            .OrderBy(d => d.CatalogDeviceType != null ? d.CatalogDeviceType.SortOrder : 999)
            .ThenBy(d => d.CatalogBrand != null ? d.CatalogBrand.Name : "")
            .ThenBy(d => d.CatalogModel != null ? d.CatalogModel.Name : "")
            .Select(d => ToResponse(d))
            .ToListAsync(ct);
    }

    public async Task<DeviceResponse?> GetDeviceByIdAsync(Guid userId, Guid id, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var device = await _db.Devices
            .Include(d => d.CatalogDeviceType)
            .Include(d => d.CatalogBrand)
            .Include(d => d.CatalogModel)
            .Include(d => d.CatalogOsFamily)
            .Include(d => d.CatalogOsVersion)
            .FirstOrDefaultAsync(d => d.Id == id && d.FamilyId == familyId && d.ArchivedAt == null, ct);

        return device is null ? null : ToResponse(device);
    }

    public async Task<DeviceResponse> CreateDeviceAsync(Guid userId, CreateDeviceRequest request, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        if (request.MemberId.HasValue)
            await RequireMemberInFamilyAsync(request.MemberId.Value, familyId, ct);

        var catalog = await ResolveCatalogCodesAsync(
            request.DeviceTypeCode, request.BrandCode, request.ModelCode,
            request.OsFamilyCode, request.OsVersionCode, ct);

        #pragma warning disable CS0618 // Obsolete — legacy columns still populated during transition
        var device = new Device
        {
            FamilyId = familyId,
            MemberId = request.MemberId,

            CatalogDeviceTypeId = catalog.DeviceTypeId,
            CatalogBrandId = catalog.BrandId,
            CatalogModelId = catalog.ModelId,
            CatalogOsFamilyId = catalog.OsFamilyId,
            CatalogOsVersionId = catalog.OsVersionId,

            // Back-fill legacy columns for backward-compat during migration period.
            DeviceType = catalog.LegacyDeviceType,
            Brand = catalog.BrandName,
            Model = catalog.ModelName,
            OsName = catalog.OsFamilyName,
            OsVersion = catalog.OsVersionName,

            SupportStatus = request.SupportStatus,
            ScreenLockEnabled = request.ScreenLockEnabled,
            BiometricEnabled = request.BiometricEnabled,
            BackupEnabled = request.BackupEnabled,
            FindMyDeviceEnabled = request.FindMyDeviceEnabled,
            Notes = request.Notes?.Trim(),
            CreatedById = userId,
            UpdatedById = userId,
        };
        #pragma warning restore CS0618

        _db.Devices.Add(device);
        await _db.SaveChangesAsync(ct);

        // Reload navigations for the response.
        await _db.Entry(device).Reference(d => d.CatalogDeviceType).LoadAsync(ct);
        await _db.Entry(device).Reference(d => d.CatalogBrand).LoadAsync(ct);
        await _db.Entry(device).Reference(d => d.CatalogModel).LoadAsync(ct);
        await _db.Entry(device).Reference(d => d.CatalogOsFamily).LoadAsync(ct);
        await _db.Entry(device).Reference(d => d.CatalogOsVersion).LoadAsync(ct);

        return ToResponse(device);
    }

    public async Task<DeviceResponse?> UpdateDeviceAsync(Guid userId, Guid id, UpdateDeviceRequest request, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var device = await _db.Devices
            .Include(d => d.CatalogDeviceType)
            .Include(d => d.CatalogBrand)
            .Include(d => d.CatalogModel)
            .Include(d => d.CatalogOsFamily)
            .Include(d => d.CatalogOsVersion)
            .FirstOrDefaultAsync(d => d.Id == id && d.FamilyId == familyId && d.ArchivedAt == null, ct);

        if (device is null)
            return null;

        if (request.MemberId.HasValue)
            await RequireMemberInFamilyAsync(request.MemberId.Value, familyId, ct);

        var catalog = await ResolveCatalogCodesAsync(
            request.DeviceTypeCode, request.BrandCode, request.ModelCode,
            request.OsFamilyCode, request.OsVersionCode, ct);

        device.MemberId = request.MemberId;

        device.CatalogDeviceTypeId = catalog.DeviceTypeId;
        device.CatalogBrandId = catalog.BrandId;
        device.CatalogModelId = catalog.ModelId;
        device.CatalogOsFamilyId = catalog.OsFamilyId;
        device.CatalogOsVersionId = catalog.OsVersionId;

        #pragma warning disable CS0618
        device.DeviceType = catalog.LegacyDeviceType;
        device.Brand = catalog.BrandName;
        device.Model = catalog.ModelName;
        device.OsName = catalog.OsFamilyName;
        device.OsVersion = catalog.OsVersionName;
        #pragma warning restore CS0618

        device.SupportStatus = request.SupportStatus;
        device.ScreenLockEnabled = request.ScreenLockEnabled;
        device.BiometricEnabled = request.BiometricEnabled;
        device.BackupEnabled = request.BackupEnabled;
        device.FindMyDeviceEnabled = request.FindMyDeviceEnabled;
        device.Notes = request.Notes?.Trim();
        device.UpdatedById = userId;

        await _db.SaveChangesAsync(ct);

        // Reload navigations in case any FK changed.
        await _db.Entry(device).Reference(d => d.CatalogDeviceType).LoadAsync(ct);
        await _db.Entry(device).Reference(d => d.CatalogBrand).LoadAsync(ct);
        await _db.Entry(device).Reference(d => d.CatalogModel).LoadAsync(ct);
        await _db.Entry(device).Reference(d => d.CatalogOsFamily).LoadAsync(ct);
        await _db.Entry(device).Reference(d => d.CatalogOsVersion).LoadAsync(ct);

        return ToResponse(device);
    }

    public async Task<bool> ArchiveDeviceAsync(Guid userId, Guid id, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var device = await _db.Devices
            .FirstOrDefaultAsync(d => d.Id == id && d.FamilyId == familyId && d.ArchivedAt == null, ct);

        if (device is null)
            return false;

        device.ArchivedAt = DateTimeOffset.UtcNow;
        device.UpdatedById = userId;
        await _db.SaveChangesAsync(ct);

        return true;
    }

    public async Task<DeviceSummaryResponse> GetSummaryAsync(Guid userId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var devices = await _db.Devices
            .Where(d => d.FamilyId == familyId && d.ArchivedAt == null)
            .Select(d => new
            {
                d.ScreenLockEnabled,
                d.BackupEnabled,
                d.BiometricEnabled,
                d.FindMyDeviceEnabled,
                d.SupportStatus,
            })
            .ToListAsync(ct);

        return new DeviceSummaryResponse(
            Total: devices.Count,
            WithoutScreenLock: devices.Count(d => !d.ScreenLockEnabled),
            WithoutBackup: devices.Count(d => !d.BackupEnabled),
            WithoutBiometric: devices.Count(d => !d.BiometricEnabled),
            EndOfLife: devices.Count(d => d.SupportStatus == SupportStatus.EndOfLife),
            WithoutFindMyDevice: devices.Count(d => !d.FindMyDeviceEnabled));
    }

    // ── Catalog resolution ────────────────────────────────────────────────────

    private record CatalogIds(
        Guid DeviceTypeId, Guid BrandId, Guid ModelId, Guid OsFamilyId, Guid OsVersionId,
        DeviceType LegacyDeviceType, string BrandName, string ModelName,
        string OsFamilyName, string OsVersionName);

    /// <summary>
    /// Resolves catalog codes to their IDs, throwing <see cref="BadRequestException"/>
    /// if any code doesn't match an active catalog record.
    /// </summary>
    private async Task<CatalogIds> ResolveCatalogCodesAsync(
        string deviceTypeCode, string brandCode, string modelCode,
        string osFamilyCode, string osVersionCode, CancellationToken ct)
    {
        var deviceType = await _db.DeviceCatalogDeviceTypes
            .AsNoTracking()
            .Where(dt => dt.Code == deviceTypeCode && dt.IsActive)
            .Select(dt => new { dt.Id, dt.Code, dt.Name })
            .FirstOrDefaultAsync(ct)
            ?? throw new BadRequestException($"Invalid device type code: '{deviceTypeCode}'.");

        var brand = await _db.DeviceCatalogBrands
            .AsNoTracking()
            .Where(b => b.Code == brandCode && b.IsActive)
            .Select(b => new { b.Id, b.Name })
            .FirstOrDefaultAsync(ct)
            ?? throw new BadRequestException($"Invalid brand code: '{brandCode}'.");

        var model = await _db.DeviceCatalogModels
            .AsNoTracking()
            .Where(m => m.Code == modelCode && m.IsActive)
            .Select(m => new { m.Id, m.Name })
            .FirstOrDefaultAsync(ct)
            ?? throw new BadRequestException($"Invalid model code: '{modelCode}'.");

        var osFamily = await _db.DeviceCatalogOsFamilies
            .AsNoTracking()
            .Where(o => o.Code == osFamilyCode && o.IsActive)
            .Select(o => new { o.Id, o.Name })
            .FirstOrDefaultAsync(ct)
            ?? throw new BadRequestException($"Invalid OS family code: '{osFamilyCode}'.");

        var osVersion = await _db.DeviceCatalogOsVersions
            .AsNoTracking()
            .Where(v => v.Code == osVersionCode && v.IsActive)
            .Select(v => new { v.Id, v.Name })
            .FirstOrDefaultAsync(ct)
            ?? throw new BadRequestException($"Invalid OS version code: '{osVersionCode}'.");

        // Map catalog device-type code → legacy enum.
        var legacyType = deviceType.Code switch
        {
            "smartphone" => DeviceType.Smartphone,
            "tablet" => DeviceType.Tablet,
            "laptop" => DeviceType.Laptop,
            "desktop" => DeviceType.Desktop,
            "smartwatch" => DeviceType.SmartWatch,
            _ => DeviceType.Other,
        };

        return new CatalogIds(
            deviceType.Id, brand.Id, model.Id, osFamily.Id, osVersion.Id,
            legacyType, brand.Name, model.Name, osFamily.Name, osVersion.Name);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<Guid> RequireFamilyIdAsync(Guid userId, CancellationToken ct)
    {
        var familyId = await _db.FamilyMembers
            .Where(m => m.UserId == userId)
            .Select(m => (Guid?)m.FamilyId)
            .FirstOrDefaultAsync(ct);

        if (familyId is null)
            throw new ForbiddenException("You must be part of a family to manage devices.");

        return familyId.Value;
    }

    private async Task RequireMemberInFamilyAsync(Guid memberId, Guid familyId, CancellationToken ct)
    {
        var exists = await _db.FamilyPersons
            .AnyAsync(p => p.Id == memberId && p.FamilyId == familyId && p.ArchivedAt == null, ct);

        if (!exists)
            throw new ForbiddenException("The specified member does not belong to your family.");
    }

    private static DeviceResponse ToResponse(Device d) =>
        new(d.Id, d.FamilyId, d.MemberId,
            DeviceTypeCode: d.CatalogDeviceType?.Code ?? "",
            DeviceTypeName: d.CatalogDeviceType?.Name ?? "",
            BrandCode: d.CatalogBrand?.Code ?? "",
            BrandName: d.CatalogBrand?.Name ?? "",
            ModelCode: d.CatalogModel?.Code ?? "",
            ModelName: d.CatalogModel?.Name ?? "",
            OsFamilyCode: d.CatalogOsFamily?.Code ?? "",
            OsFamilyName: d.CatalogOsFamily?.Name ?? "",
            OsVersionCode: d.CatalogOsVersion?.Code ?? "",
            OsVersionName: d.CatalogOsVersion?.Name ?? "",
            d.SupportStatus,
            d.ScreenLockEnabled, d.BiometricEnabled, d.BackupEnabled, d.FindMyDeviceEnabled,
            d.Notes, d.CreatedAt, d.UpdatedAt);
}
