namespace SafeFamily.Api.Features.Checklists.Dtos;

public record ChecklistItemDto(
    Guid Id,
    string Title,
    string Description,
    string Category,
    string Status,
    int Priority,
    string SourceType,
    string? SourceId,
    DateTimeOffset? DueAt,
    string? HelpUrl);

public record ChecklistSummaryDto(
    int TotalTasks,
    int HighPriorityTasks,
    int InProgressTasks,
    int CompletedTasks);

public record ChecklistQueryParams(
    string? Severity = null,
    string? Status = null,
    string? Category = null,
    string? Search = null);

public record UpdateChecklistStatusRequest(string Status);
