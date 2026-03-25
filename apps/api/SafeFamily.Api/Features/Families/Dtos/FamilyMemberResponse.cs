using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Features.Families.Dtos;

public record FamilyMemberResponse(
    Guid Id,
    Guid FamilyId,
    string DisplayName,
    string Relationship,
    AgeGroup AgeGroup,
    string PrimaryEcosystem,
    bool IsPrimaryContact,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
