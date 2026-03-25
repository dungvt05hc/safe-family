using System.ComponentModel.DataAnnotations;

namespace SafeFamily.Api.Features.Families.Dtos;

public class CreateFamilyRequest
{
    [Required]
    [MaxLength(200)]
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>ISO 3166-1 alpha-2 country code (e.g. "US", "BR").</summary>
    [Required]
    [StringLength(2, MinimumLength = 2)]
    public string CountryCode { get; set; } = string.Empty;

    /// <summary>IANA timezone identifier (e.g. "America/New_York").</summary>
    [Required]
    [MaxLength(100)]
    public string Timezone { get; set; } = string.Empty;
}
