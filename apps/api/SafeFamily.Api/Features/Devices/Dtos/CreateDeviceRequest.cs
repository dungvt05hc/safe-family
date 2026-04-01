using System.ComponentModel.DataAnnotations;
using SafeFamily.Api.Domain.Devices;

namespace SafeFamily.Api.Features.Devices.Dtos;

public class CreateDeviceRequest
{
    /// <summary>Optional — links this device to a specific family member (FamilyPerson).</summary>
    public Guid? MemberId { get; set; }

    /// <summary>Catalog device-type code, e.g. "smartphone", "laptop".</summary>
    [Required]
    [MaxLength(50)]
    public string DeviceTypeCode { get; set; } = string.Empty;

    /// <summary>Catalog brand code, e.g. "apple", "samsung".</summary>
    [Required]
    [MaxLength(50)]
    public string BrandCode { get; set; } = string.Empty;

    /// <summary>Catalog model code, e.g. "iphone-15-pro".</summary>
    [Required]
    [MaxLength(100)]
    public string ModelCode { get; set; } = string.Empty;

    /// <summary>Catalog OS family code, e.g. "ios", "android".</summary>
    [Required]
    [MaxLength(50)]
    public string OsFamilyCode { get; set; } = string.Empty;

    /// <summary>Catalog OS version code, e.g. "ios-18", "android-15".</summary>
    [Required]
    [MaxLength(50)]
    public string OsVersionCode { get; set; } = string.Empty;

    public SupportStatus SupportStatus { get; set; }
    public bool ScreenLockEnabled { get; set; }
    public bool BiometricEnabled { get; set; }
    public bool BackupEnabled { get; set; }
    public bool FindMyDeviceEnabled { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}
