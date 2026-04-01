using SafeFamily.Api.Domain.Devices;

namespace SafeFamily.Api.Features.Devices.Dtos;

public record DeviceResponse(
    Guid Id,
    Guid FamilyId,
    Guid? MemberId,

    // ── Catalog references (codes + display names) ──────────────────────────
    string DeviceTypeCode,
    string DeviceTypeName,
    string BrandCode,
    string BrandName,
    string ModelCode,
    string ModelName,
    string OsFamilyCode,
    string OsFamilyName,
    string OsVersionCode,
    string OsVersionName,

    // ── Security & metadata ─────────────────────────────────────────────────
    SupportStatus SupportStatus,
    bool ScreenLockEnabled,
    bool BiometricEnabled,
    bool BackupEnabled,
    bool FindMyDeviceEnabled,
    string? Notes,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
