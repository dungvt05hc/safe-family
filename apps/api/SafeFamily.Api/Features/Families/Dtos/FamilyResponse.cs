namespace SafeFamily.Api.Features.Families.Dtos;

public record FamilyResponse(
    Guid Id,
    string DisplayName,
    string CountryCode,
    string Timezone,
    DateTimeOffset CreatedAt);
