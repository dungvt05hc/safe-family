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

    public async Task<IReadOnlyList<DeviceResponse>> GetDevicesAsync(Guid userId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        return await _db.Devices
            .Where(d => d.FamilyId == familyId)
            .OrderBy(d => d.DeviceType)
            .ThenBy(d => d.Brand)
            .ThenBy(d => d.Model)
            .Select(d => ToResponse(d))
            .ToListAsync(ct);
    }

    public async Task<DeviceResponse?> GetDeviceByIdAsync(Guid userId, Guid id, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var device = await _db.Devices
            .FirstOrDefaultAsync(d => d.Id == id && d.FamilyId == familyId, ct);

        return device is null ? null : ToResponse(device);
    }

    public async Task<DeviceResponse> CreateDeviceAsync(Guid userId, CreateDeviceRequest request, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        if (request.MemberId.HasValue)
            await RequireMemberInFamilyAsync(request.MemberId.Value, familyId, ct);

        var device = new Device
        {
            FamilyId = familyId,
            MemberId = request.MemberId,
            DeviceType = request.DeviceType,
            Brand = request.Brand.Trim(),
            Model = request.Model.Trim(),
            OsName = request.OsName.Trim(),
            OsVersion = request.OsVersion.Trim(),
            SupportStatus = request.SupportStatus,
            ScreenLockEnabled = request.ScreenLockEnabled,
            BiometricEnabled = request.BiometricEnabled,
            BackupEnabled = request.BackupEnabled,
            FindMyDeviceEnabled = request.FindMyDeviceEnabled,
            Notes = request.Notes?.Trim(),
            CreatedById = userId,
            UpdatedById = userId,
        };

        _db.Devices.Add(device);
        await _db.SaveChangesAsync(ct);

        return ToResponse(device);
    }

    public async Task<DeviceResponse?> UpdateDeviceAsync(Guid userId, Guid id, UpdateDeviceRequest request, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var device = await _db.Devices
            .FirstOrDefaultAsync(d => d.Id == id && d.FamilyId == familyId, ct);

        if (device is null)
            return null;

        if (request.MemberId.HasValue)
            await RequireMemberInFamilyAsync(request.MemberId.Value, familyId, ct);

        device.MemberId = request.MemberId;
        device.DeviceType = request.DeviceType;
        device.Brand = request.Brand.Trim();
        device.Model = request.Model.Trim();
        device.OsName = request.OsName.Trim();
        device.OsVersion = request.OsVersion.Trim();
        device.SupportStatus = request.SupportStatus;
        device.ScreenLockEnabled = request.ScreenLockEnabled;
        device.BiometricEnabled = request.BiometricEnabled;
        device.BackupEnabled = request.BackupEnabled;
        device.FindMyDeviceEnabled = request.FindMyDeviceEnabled;
        device.Notes = request.Notes?.Trim();
        device.UpdatedById = userId;

        await _db.SaveChangesAsync(ct);

        return ToResponse(device);
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
        new(d.Id, d.FamilyId, d.MemberId, d.DeviceType, d.Brand, d.Model,
            d.OsName, d.OsVersion, d.SupportStatus,
            d.ScreenLockEnabled, d.BiometricEnabled, d.BackupEnabled, d.FindMyDeviceEnabled,
            d.Notes, d.CreatedAt, d.UpdatedAt);
}
