using System.ComponentModel.DataAnnotations;
using SafeFamily.Api.Domain.Devices;

namespace SafeFamily.Api.Features.Devices.Dtos;

public class UpdateDeviceRequest
{
    /// <summary>Optional — links this device to a specific family member (FamilyPerson).</summary>
    public Guid? MemberId { get; set; }

    [Required]
    public DeviceType DeviceType { get; set; }

    [Required]
    [MaxLength(100)]
    public string Brand { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Model { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string OsName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string OsVersion { get; set; } = string.Empty;

    public SupportStatus SupportStatus { get; set; }
    public bool ScreenLockEnabled { get; set; }
    public bool BiometricEnabled { get; set; }
    public bool BackupEnabled { get; set; }
    public bool FindMyDeviceEnabled { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}
