using SafeFamily.Api.Features.Devices.Dtos;

namespace SafeFamily.Api.Features.Devices;

public interface IDeviceService
{
    Task<IReadOnlyList<DeviceResponse>> GetDevicesAsync(Guid userId, DeviceQuery query, CancellationToken ct = default);
    Task<DeviceResponse?> GetDeviceByIdAsync(Guid userId, Guid id, CancellationToken ct = default);
    Task<DeviceResponse> CreateDeviceAsync(Guid userId, CreateDeviceRequest request, CancellationToken ct = default);
    Task<DeviceResponse?> UpdateDeviceAsync(Guid userId, Guid id, UpdateDeviceRequest request, CancellationToken ct = default);
    Task<bool> ArchiveDeviceAsync(Guid userId, Guid id, CancellationToken ct = default);
    Task<DeviceSummaryResponse> GetSummaryAsync(Guid userId, CancellationToken ct = default);
}
