using SafeFamily.Api.Domain.Common;

namespace SafeFamily.Api.Domain.Devices;

/// <summary>
/// Catalog entry for a device type category (e.g. Smartphone, Tablet, Laptop).
/// This is independent of the <see cref="DeviceType"/> enum used on the Device entity;
/// the enum stays for backward-compat, this table powers the catalog dropdowns.
/// </summary>
public class DeviceCatalogDeviceType : BaseEntity
{
    /// <summary>Unique slug, e.g. "smartphone", "tablet", "laptop".</summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>Display name, e.g. "Smartphone", "Tablet", "Laptop".</summary>
    public string Name { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    // ── Navigation ─────────────────────────────────────────────────────────────
    public ICollection<DeviceCatalogModel> Models { get; set; } = [];
}
