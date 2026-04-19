using SafeFamily.Api.Domain.Tasks;

namespace SafeFamily.Api.Features.Tasks.Generation;

/// <summary>
/// Describes a single safety task that the generation engine should ensure exists for a family.
///
/// A <see cref="TaskGenerationSpec"/> is the *rule definition* — it represents what a task should
/// look like, not whether it already exists in the database.  The engine is responsible for
/// deciding whether to create, refresh, or skip based on the family's current task state.
///
/// Immutable: callers build specs via object-initialiser syntax and pass them to
/// <see cref="ISafetyTaskGenerationService.GenerateAsync"/>.
/// </summary>
public sealed class TaskGenerationSpec
{
    // ── Identity (used for deduplication) ─────────────────────────────────────

    /// <summary>
    /// Stable, deterministic key that identifies this task rule for a specific target.
    /// Must be globally unique within a family.
    ///
    /// Use <see cref="GenerationKeyStrategy"/> factory methods to produce canonical keys:
    ///   task:account:enable_2fa:{accountId}
    ///   task:device:enable_backup:{deviceId}
    ///   task:incident:sign_out_sessions:{incidentId}
    ///
    /// The engine uses this key to detect whether an equivalent task already exists,
    /// making task generation idempotent — safe to call on every source event.
    /// </summary>
    public required string GenerationKey { get; init; }

    /// <summary>Which product or system rule is generating this task.</summary>
    public required TaskSourceType SourceType { get; init; }

    /// <summary>
    /// Identifies the source signal within its type (e.g. bookingId, incidentId).
    /// Null for system-rule tasks where the key itself is the unique signal.
    /// </summary>
    public string? SourceId { get; init; }

    // ── Target ─────────────────────────────────────────────────────────────────

    /// <summary>The family this task belongs to.</summary>
    public required Guid FamilyId { get; init; }

    /// <summary>The type of entity this task is directed at.</summary>
    public TaskTargetType TargetType { get; init; } = TaskTargetType.Family;

    /// <summary>
    /// The ID of the specific target entity (member, device, account).
    /// Null when <see cref="TargetType"/> is <see cref="TaskTargetType.Family"/>.
    /// </summary>
    public Guid? TargetId { get; init; }

    /// <summary>
    /// Snapshot of the target's display name at generation time.
    /// Preserved so renames of the target entity do not break task display.
    /// </summary>
    public string? TargetLabel { get; init; }

    // ── Content ────────────────────────────────────────────────────────────────

    public required string Title { get; init; }
    public required string Description { get; init; }

    /// <summary>Short motivational explanation shown to the family.</summary>
    public string? WhyThisMatters { get; init; }

    /// <summary>Step-by-step Markdown guidance. Populated for booking-sourced tasks.</summary>
    public string? GuidanceMarkdown { get; init; }

    /// <summary>URL to an external or internal help article.</summary>
    public string? HelpLink { get; init; }

    // ── Classification ─────────────────────────────────────────────────────────

    public required TaskCategory   Category  { get; init; }
    public required TaskPriority   Priority  { get; init; }
    public required TaskPhase      Phase     { get; init; }

    /// <summary>Controls sort order within a phase group in the UI.</summary>
    public int SortOrder { get; init; }

    /// <summary>Optional deadline for this task.</summary>
    public DateTimeOffset? DueAt { get; init; }

    /// <summary>Whether this task requires the PremiumTasksAccess entitlement to be visible.</summary>
    public bool IsPremium { get; init; }
}
