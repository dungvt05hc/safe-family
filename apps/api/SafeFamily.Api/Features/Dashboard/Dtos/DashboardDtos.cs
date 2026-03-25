namespace SafeFamily.Api.Features.Dashboard.Dtos;

public record DashboardResponse(
    FamilySummaryDto Family,
    RiskSummaryDto RiskSummary,
    CountsSummaryDto Counts,
    IReadOnlyList<string> ImmediateActions,
    IReadOnlyList<TopChecklistItemDto> TopPendingItems);

public record FamilySummaryDto(
    Guid Id,
    string DisplayName,
    string CountryCode,
    string Timezone);

public record RiskSummaryDto(
    int? OverallScore,
    string? RiskLevel,
    DateTimeOffset? LastAssessedAt);

public record CountsSummaryDto(
    int Members,
    int Accounts,
    int Devices,
    int PendingChecklistItems);

public record TopChecklistItemDto(
    Guid Id,
    string Title,
    string Category,
    int Priority);
