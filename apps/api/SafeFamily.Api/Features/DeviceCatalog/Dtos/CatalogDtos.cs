namespace SafeFamily.Api.Features.DeviceCatalog.Dtos;

/// <summary>
/// Lightweight DTO shared by all catalog dropdown endpoints.
/// </summary>
public record CatalogItemDto(Guid Id, string Code, string Name);

/// <summary>
/// Extended model DTO — includes the default OS family so the frontend
/// can auto-select the OS dropdown when a model is picked.
/// </summary>
public record CatalogModelDto(
    Guid Id,
    string Code,
    string Name,
    Guid? DefaultOsFamilyId,
    string? DefaultOsFamilyCode
);

/// <summary>
/// Aggregated response for the convenience /form-options endpoint.
/// Returns multiple lists in one call to reduce round-trips.
/// </summary>
public record CatalogFormOptionsDto
{
    public IReadOnlyList<CatalogItemDto> DeviceTypes { get; init; } = [];
    public IReadOnlyList<CatalogItemDto> Brands { get; init; } = [];
    public IReadOnlyList<CatalogModelDto> Models { get; init; } = [];
    public IReadOnlyList<CatalogItemDto> OsFamilies { get; init; } = [];
    public IReadOnlyList<CatalogItemDto> OsVersions { get; init; } = [];
}
