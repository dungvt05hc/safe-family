using SafeFamily.Api.Domain.Devices;

namespace SafeFamily.Api.Features.Devices.Dtos;

public record DeviceResponse(
    Guid Id,
    Guid FamilyId,
    Guid? MemberId,
    DeviceType DeviceType,
    string Brand,
    string Model,
    string OsName,
    string OsVersion,
    SupportStatus SupportStatus,
    bool ScreenLockEnabled,
    bool BiometricEnabled,
    bool BackupEnabled,
    bool FindMyDeviceEnabled,
    string? Notes,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
