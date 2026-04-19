namespace SafeFamily.Api.Features.Tasks.Generation;

/// <summary>
/// The outcome of a single call to <see cref="ISafetyTaskGenerationService.GenerateAsync"/>.
///
/// Callers use this to log, audit, or surface information about what the engine did.
/// </summary>
public sealed class TaskGenerationResult
{
    // ── Aggregate counts ──────────────────────────────────────────────────────

    /// <summary>Number of brand-new <see cref="Domain.Tasks.SafetyTask"/> rows inserted.</summary>
    public int CreatedCount { get; init; }

    /// <summary>
    /// Number of existing active tasks that were refreshed because their content
    /// (title, description, guidance, priority, etc.) changed in the spec.
    /// </summary>
    public int RefreshedCount { get; init; }

    /// <summary>
    /// Number of tasks that already existed and were identical to the incoming spec —
    /// no database write was needed.
    /// </summary>
    public int SkippedCount { get; init; }

    /// <summary>
    /// Number of tasks that were marked <c>Superseded</c> because a newer version of
    /// the same generation key was applied (e.g. a regeneration was explicitly requested).
    /// </summary>
    public int SupersededCount { get; init; }

    // ── Per-spec detail ───────────────────────────────────────────────────────

    /// <summary>Breakdown of the outcome for each processed spec, in input order.</summary>
    public IReadOnlyList<TaskGenerationOutcome> Outcomes { get; init; } = [];

    // ── Derived convenience props ─────────────────────────────────────────────

    /// <summary>Total specs processed (Created + Refreshed + Skipped + Superseded).</summary>
    public int TotalProcessed => CreatedCount + RefreshedCount + SkippedCount + SupersededCount;

    /// <summary>True when no database writes occurred (all tasks were already current).</summary>
    public bool WasNoOp => CreatedCount == 0 && RefreshedCount == 0 && SupersededCount == 0;
}

/// <summary>
/// The action taken for a single <see cref="TaskGenerationSpec"/> during a generation run.
/// </summary>
public enum TaskGenerationAction
{
    /// <summary>A new task was inserted because no task with this generation key existed.</summary>
    Created,

    /// <summary>
    /// An existing active task was found and its content or metadata was updated to match
    /// the latest spec definition.
    /// </summary>
    Refreshed,

    /// <summary>
    /// An existing active task was found and was already identical to the spec — skipped.
    /// </summary>
    Skipped,

    /// <summary>
    /// The existing task was marked Superseded and a new replacement task was created.
    /// Only occurs during an explicit regeneration pass.
    /// </summary>
    Superseded,
}

/// <summary>
/// Outcome record for a single spec within a <see cref="TaskGenerationResult"/>.
/// </summary>
public sealed record TaskGenerationOutcome(
    /// <summary>The resolved generation key for this spec.</summary>
    string GenerationKey,
    /// <summary>What the engine did for this spec.</summary>
    TaskGenerationAction Action,
    /// <summary>The ID of the resulting task (created or existing).</summary>
    Guid TaskId);
