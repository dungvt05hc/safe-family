using SafeFamily.Api.Domain.Common;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Domain.Devices;

/// <summary>
/// Represents a physical device owned or used by a family member.
/// Tracks security posture (screen lock, biometrics, backup, find-my) and support lifecycle.
/// </summary>
public class Device : AuditableEntity
{
    public Guid FamilyId { get; set; }

    /// <summary>Optional link to a specific <see cref="FamilyPerson"/> within the family.</summary>
    public Guid? MemberId { get; set; }

    // ── Catalog references (new) ───────────────────────────────────────────────

    /// <summary>FK to <see cref="DeviceCatalogDeviceType"/>.</summary>
    public Guid? CatalogDeviceTypeId { get; set; }

    /// <summary>FK to <see cref="DeviceCatalogBrand"/>.</summary>
    public Guid? CatalogBrandId { get; set; }

    /// <summary>FK to <see cref="DeviceCatalogModel"/>.</summary>
    public Guid? CatalogModelId { get; set; }

    /// <summary>FK to <see cref="DeviceCatalogOsFamily"/>.</summary>
    public Guid? CatalogOsFamilyId { get; set; }

    /// <summary>FK to <see cref="DeviceCatalogOsVersion"/>.</summary>
    public Guid? CatalogOsVersionId { get; set; }

    // ── Legacy free-text fields (kept for backward-compat / migration) ─────────

    [Obsolete("Use CatalogDeviceTypeId. Retained for data migration.")]
    public DeviceType DeviceType { get; set; }

    [Obsolete("Use CatalogBrandId. Retained for data migration.")]
    public string Brand { get; set; } = string.Empty;

    [Obsolete("Use CatalogModelId. Retained for data migration.")]
    public string Model { get; set; } = string.Empty;

    [Obsolete("Use CatalogOsFamilyId. Retained for data migration.")]
    public string OsName { get; set; } = string.Empty;

    [Obsolete("Use CatalogOsVersionId. Retained for data migration.")]
    public string OsVersion { get; set; } = string.Empty;

    // ── Security posture ───────────────────────────────────────────────────────

    public SupportStatus SupportStatus { get; set; }

    public bool ScreenLockEnabled { get; set; }
    public bool BiometricEnabled { get; set; }
    public bool BackupEnabled { get; set; }
    public bool FindMyDeviceEnabled { get; set; }

    public string? Notes { get; set; }

    public DateTimeOffset? ArchivedAt { get; set; }

    // ── Navigation ─────────────────────────────────────────────────────────────
    public Family Family { get; set; } = null!;
    public FamilyPerson? Member { get; set; }

    public DeviceCatalogDeviceType? CatalogDeviceType { get; set; }
    public DeviceCatalogBrand? CatalogBrand { get; set; }
    public DeviceCatalogModel? CatalogModel { get; set; }
    public DeviceCatalogOsFamily? CatalogOsFamily { get; set; }
    public DeviceCatalogOsVersion? CatalogOsVersion { get; set; }
}
