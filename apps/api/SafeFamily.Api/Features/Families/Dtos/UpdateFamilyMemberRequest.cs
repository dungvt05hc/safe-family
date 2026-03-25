using System.ComponentModel.DataAnnotations;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Features.Families.Dtos;

public class UpdateFamilyMemberRequest
{
    [Required]
    [MaxLength(200)]
    public string DisplayName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Relationship { get; set; } = string.Empty;

    [Required]
    public AgeGroup AgeGroup { get; set; }

    [MaxLength(100)]
    public string PrimaryEcosystem { get; set; } = string.Empty;

    public bool IsPrimaryContact { get; set; }
}
