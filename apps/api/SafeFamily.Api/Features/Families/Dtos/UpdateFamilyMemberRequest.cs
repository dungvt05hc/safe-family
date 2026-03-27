using System.ComponentModel.DataAnnotations;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Features.Families.Dtos;

public class UpdateFamilyMemberRequest
{
    [Required]
    [MaxLength(200)]
    public string DisplayName { get; set; } = string.Empty;

    [Required]
    [AllowedValues("self", "spouse", "son", "daughter", "father", "mother",
                   "grandfather", "grandmother", "sibling", "relative", "caregiver", "other")]
    public string Relationship { get; set; } = string.Empty;

    [Required]
    public AgeGroup AgeGroup { get; set; }

    [AllowedValues("google", "apple", "microsoft", "android", "mixed", "other", "")]
    public string PrimaryEcosystem { get; set; } = string.Empty;

    public bool IsPrimaryContact { get; set; }
}
