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

    public DeviceType DeviceType { get; set; }

    /// <summary>Device brand, e.g. "Apple", "Samsung", "Dell".</summary>
    public string Brand { get; set; } = string.Empty;

    /// <summary>Device model name, e.g. "iPhone 15 Pro", "Galaxy S24".</summary>
    public string Model { get; set; } = string.Empty;

    /// <summary>Operating system name, e.g. "iOS", "Android", "Windows", "macOS".</summary>
    public string OsName { get; set; } = string.Empty;

    /// <summary>Operating system version, e.g. "17.4", "14", "11".</summary>
    public string OsVersion { get; set; } = string.Empty;

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
}
