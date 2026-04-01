using SafeFamily.Api.Domain.Common;

namespace SafeFamily.Api.Domain.Devices;

/// <summary>
/// A specific OS version in the catalog (e.g. iOS 18, Android 15, Windows 11).
/// Belongs to an <see cref="DeviceCatalogOsFamily"/>.
/// </summary>
public class DeviceCatalogOsVersion : BaseEntity
{
    /// <summary>Unique slug, e.g. "ios-18", "android-15", "windows-11".</summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>Display name / version string, e.g. "18", "15", "11", "Sequoia".</summary>
    public string Name { get; set; } = string.Empty;

    public Guid OsFamilyId { get; set; }

    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    // ── Navigation ─────────────────────────────────────────────────────────────
    public DeviceCatalogOsFamily OsFamily { get; set; } = null!;
}
