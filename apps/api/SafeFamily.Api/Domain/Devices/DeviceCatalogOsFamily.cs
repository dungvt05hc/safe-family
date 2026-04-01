using SafeFamily.Api.Domain.Common;

namespace SafeFamily.Api.Domain.Devices;

/// <summary>
/// An operating system family in the catalog (e.g. iOS, Android, Windows, macOS).
/// </summary>
public class DeviceCatalogOsFamily : BaseEntity
{
    /// <summary>Unique slug, e.g. "ios", "android", "windows".</summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>Display name, e.g. "iOS", "Android", "Windows".</summary>
    public string Name { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    // ── Navigation ─────────────────────────────────────────────────────────────
    public ICollection<DeviceCatalogOsVersion> Versions { get; set; } = [];
    public ICollection<DeviceCatalogModel> DefaultModels { get; set; } = [];
}
