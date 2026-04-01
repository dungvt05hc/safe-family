using SafeFamily.Api.Features.DeviceCatalog.Dtos;

namespace SafeFamily.Api.Features.DeviceCatalog;

public interface IDeviceCatalogService
{
    Task<IReadOnlyList<CatalogItemDto>> GetDeviceTypesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<CatalogItemDto>> GetBrandsAsync(string? deviceTypeCode, CancellationToken ct = default);
    Task<IReadOnlyList<CatalogModelDto>> GetModelsAsync(string? deviceTypeCode, string? brandCode, CancellationToken ct = default);
    Task<IReadOnlyList<CatalogItemDto>> GetOsFamiliesAsync(string? modelCode, CancellationToken ct = default);
    Task<IReadOnlyList<CatalogItemDto>> GetOsVersionsAsync(string osFamilyCode, CancellationToken ct = default);
    Task<CatalogFormOptionsDto> GetFormOptionsAsync(string? deviceTypeCode, string? brandCode, string? modelCode, CancellationToken ct = default);
}
