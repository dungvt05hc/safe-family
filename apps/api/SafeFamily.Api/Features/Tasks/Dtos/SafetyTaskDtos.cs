using System.ComponentModel.DataAnnotations;

namespace SafeFamily.Api.Features.Tasks.Dtos;

/// <summary>Full representation of a safety task returned from the API.</summary>
public record SafetyTaskDto(
    Guid             Id,
    Guid             FamilyId,
    string           SourceType,
    string?          SourceId,
    string           TargetType,
    Guid?            TargetId,
    string?          TargetLabel,
    string           Title,
    string           Description,
    string?          WhyThisMatters,
    string?          GuidanceMarkdown,
    string?          HelpLink,
    string           Category,
    string           Priority,
    string           Phase,
    string           Status,
    int              SortOrder,
    DateTimeOffset?  DueAt,
    bool             IsPremium,
    bool             IsGenerated,
    string?          GenerationKey,
    Guid?            SupersededByTaskId,
    DateTimeOffset?  CompletedAt,
    DateTimeOffset?  SkippedAt,
    DateTimeOffset   CreatedAt,
    DateTimeOffset   UpdatedAt);

/// <summary>Lightweight aggregate counts for the family's safety task list.</summary>
public record SafetyTaskSummaryDto(
    int TotalTasks,
    int CompletedTasks,
    /// Phase=Immediate tasks that are still Pending or InProgress.
    int CriticalRemaining,
    /// Priority=High tasks that are still Pending or InProgress.
    int HighRemaining,
    int TasksInProgress);

/// <summary>Request body for PATCH /api/tasks/{id}/status.</summary>
public class UpdateSafetyTaskStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;

    /// <summary>Optional reason or comment for the status change (e.g. dismissal reason).</summary>
    [MaxLength(500)]
    public string? Notes { get; set; }
}

/// <summary>Optional query parameters for GET /api/tasks.</summary>
public record SafetyTaskQueryParams(
    string? Status     = null,
    string? Priority   = null,
    string? Phase      = null,
    string? Category   = null,
    string? SourceType = null,
    string? TargetType = null,
    Guid?   TargetId   = null,
    string? Search     = null);
