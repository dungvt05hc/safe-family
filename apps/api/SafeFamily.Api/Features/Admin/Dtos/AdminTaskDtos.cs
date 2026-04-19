namespace SafeFamily.Api.Features.Admin.Dtos;

// ── Family task summary ───────────────────────────────────────────────────────

/// <summary>
/// Aggregate view of all safety tasks for a family, used by admins to quickly
/// gauge generation health without scrolling through individual tasks.
/// </summary>
public record AdminFamilyTaskSummaryDto(
    Guid FamilyId,
    int Total,
    int Pending,
    int InProgress,
    int Completed,
    int Dismissed,
    int Superseded,
    /// <summary>Tasks with IsGenerated = true (rule-driven, not manual).</summary>
    int Generated,
    /// <summary>Tasks created manually by an advisor or family member.</summary>
    int Manual,
    /// <summary>CreatedAt of the most recently generated task, or null if none.</summary>
    DateTimeOffset? LastGeneratedAt,
    IReadOnlyList<AdminTaskSourceBreakdownRow> BySourceType);

/// <summary>Per-source-type breakdown used inside <see cref="AdminFamilyTaskSummaryDto"/>.</summary>
public record AdminTaskSourceBreakdownRow(
    string SourceType,
    int Total,
    int Completed,
    int Pending);

// ── Generation log ────────────────────────────────────────────────────────────

/// <summary>
/// Full debug view of every safety task generated for a family, including each
/// task's lifecycle events. Ordered newest task first.
/// </summary>
public record AdminTaskGenerationLogDto(
    Guid FamilyId,
    DateTimeOffset AsAt,
    int TotalTasks,
    IReadOnlyList<AdminTaskLogEntry> Tasks);

/// <summary>
/// Single task entry within the generation log, carrying its full event timeline.
/// </summary>
public record AdminTaskLogEntry(
    Guid Id,
    string SourceType,
    string? SourceId,
    string? GenerationKey,
    Guid? BookingId,
    string Title,
    string Phase,
    string Priority,
    string Status,
    bool IsGenerated,
    Guid? SupersededByTaskId,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    IReadOnlyList<AdminTaskEventDto> Events);

/// <summary>A single lifecycle event on a safety task.</summary>
public record AdminTaskEventDto(
    Guid Id,
    string EventType,
    string? OldStatus,
    string? NewStatus,
    string? Notes,
    Guid? CreatedById,
    DateTimeOffset CreatedAt);

// ── Regeneration result ───────────────────────────────────────────────────────

/// <summary>
/// Response returned after an admin-triggered task regeneration for a family.
/// Contains aggregate counts and per-spec outcomes for debugging.
/// </summary>
public record AdminTaskGenerationResultDto(
    Guid FamilyId,
    Guid? AssessmentId,
    int Created,
    int Refreshed,
    int Skipped,
    int Superseded,
    bool WasNoOp,
    string Message,
    DateTimeOffset TriggeredAt,
    IReadOnlyList<AdminTaskOutcomeDto> Outcomes);

/// <summary>Outcome for a single spec during an admin-triggered regeneration.</summary>
public record AdminTaskOutcomeDto(
    string GenerationKey,
    string Action,
    Guid TaskId);
