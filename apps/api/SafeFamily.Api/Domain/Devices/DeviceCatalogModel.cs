using SafeFamily.Api.Domain.Common;

namespace SafeFamily.Api.Domain.Devices;

/// <summary>
/// A device model in the catalog (e.g. "iPhone 15 Pro", "Galaxy S24 Ultra").
/// Belongs to a Brand, a DeviceType category, and optionally links to a default OsFamily.
/// </summary>
public class DeviceCatalogModel : BaseEntity
{
    /// <summary>Unique slug, e.g. "iphone-15-pro", "galaxy-s24-ultra".</summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>Display name, e.g. "iPhone 15 Pro", "Galaxy S24 Ultra".</summary>
    public string Name { get; set; } = string.Empty;

    public Guid BrandId { get; set; }

    /// <summary>
    /// Which device type category this specific model belongs to.
    /// This is the link between Brand and DeviceType — a brand like Apple can have
    /// Smartphone models (iPhone), Tablet models (iPad), Laptop models (MacBook), etc.
    /// </summary>
    public Guid DeviceTypeId { get; set; }

    /// <summary>
    /// Default OS family for this model (e.g. iOS for iPhones, macOS for MacBooks).
    /// Null if not deterministic or if the OS is ambiguous (e.g. some Dell models run Windows or Ubuntu).
    /// </summary>
    public Guid? DefaultOsFamilyId { get; set; }

    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    // ── Navigation ─────────────────────────────────────────────────────────────
    public DeviceCatalogBrand Brand { get; set; } = null!;
    public DeviceCatalogDeviceType DeviceType { get; set; } = null!;
    public DeviceCatalogOsFamily? DefaultOsFamily { get; set; }
}
