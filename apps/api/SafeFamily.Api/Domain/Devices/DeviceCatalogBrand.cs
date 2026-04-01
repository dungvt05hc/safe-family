using SafeFamily.Api.Domain.Common;

namespace SafeFamily.Api.Domain.Devices;

/// <summary>
/// A device brand in the catalog (e.g. Apple, Samsung, Dell).
/// Brands are shared across device types — the mapping is done at the Model level.
/// </summary>
public class DeviceCatalogBrand : BaseEntity
{
    /// <summary>Unique slug, e.g. "apple", "samsung", "dell".</summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>Display name, e.g. "Apple", "Samsung", "Dell".</summary>
    public string Name { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    // ── Navigation ─────────────────────────────────────────────────────────────
    public ICollection<DeviceCatalogModel> Models { get; set; } = [];
}
