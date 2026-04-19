using SafeFamily.Api.Domain.Common;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Domain.Tasks;

/// <summary>
/// A unified, actionable safety task assigned to a family.
///
/// Safety tasks can be generated from multiple sources:
///   - account/device system rules (auto-reconciled on each fetch)
///   - free safety check fulfillment
///   - family safety plan fulfillment
///   - incident recovery pack fulfillment
///   - annual safety plan fulfillment
///   - manual creation by a family member or advisor
///
/// Deduplication and regeneration are controlled via <see cref="GenerationKey"/>.
/// When a task is regenerated, the old task is soft-marked as Superseded and a new
/// task is created, linked back via <see cref="SupersededByTaskId"/>.
/// </summary>
public class SafetyTask : BaseEntity
{
    // ── Family scope ──────────────────────────────────────────────────────────

    public Guid FamilyId { get; set; }

    // ── Source tracking ───────────────────────────────────────────────────────

    /// <summary>Which product or system rule generated this task.</summary>
    public TaskSourceType SourceType { get; set; }

    /// <summary>
    /// Stable, human-readable identifier for the source signal used for deduplication.
    /// For system rules: "acc-2fa:{accountId}", "dev-screenlock:{deviceId}".
    /// For booking products: "free-check:{bookingId}:1", "family-plan:{bookingId}:3".
    /// Null for manual tasks.
    /// </summary>
    public string? SourceId { get; set; }

    // ── Target tracking ───────────────────────────────────────────────────────

    /// <summary>The type of entity this task is directed at (Family, Member, Device, Account).</summary>
    public TaskTargetType TargetType { get; set; } = TaskTargetType.Family;

    /// <summary>
    /// The ID of the specific target entity when TargetType is not Family.
    /// Refers to a FamilyMember, Device, or Account record.
    /// </summary>
    public Guid? TargetId { get; set; }

    /// <summary>
    /// Snapshot of the target's display name at task creation time.
    /// Preserved so renames of the target entity do not break task display.
    /// Example: "John's iPhone 15 Pro", "sarah@gmail.com".
    /// </summary>
    public string? TargetLabel { get; set; }

    // ── Content ───────────────────────────────────────────────────────────────

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Short motivational explanation of why completing this task matters.
    /// Shown in the UI to help families understand the risk context.
    /// </summary>
    public string? WhyThisMatters { get; set; }

    /// <summary>
    /// Detailed step-by-step guidance in Markdown.
    /// Populated for booking-sourced tasks; null for simple system-rule tasks.
    /// </summary>
    public string? GuidanceMarkdown { get; set; }

    /// <summary>URL to an external or internal help article for this task.</summary>
    public string? HelpLink { get; set; }

    // ── Classification ────────────────────────────────────────────────────────

    public TaskCategory Category { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public TaskPhase    Phase    { get; set; } = TaskPhase.Ongoing;

    // ── State ─────────────────────────────────────────────────────────────────

    public TaskStatus Status { get; set; } = TaskStatus.Pending;

    /// <summary>
    /// Display ordering within the family's task list.
    /// Lower values appear first. Default 100 places un-ordered tasks at the end.
    /// </summary>
    public int SortOrder { get; set; } = 100;

    /// <summary>Optional date by which the task should be completed.</summary>
    public DateTimeOffset? DueAt { get; set; }

    // ── Premium gating ────────────────────────────────────────────────────────

    /// <summary>
    /// When true this task is only visible to families that hold a premium entitlement.
    /// FreeCheck tasks are not premium; all other booking-sourced and system-rule tasks are.
    /// </summary>
    public bool IsPremium { get; set; } = false;

    // ── Generation / deduplication ────────────────────────────────────────────

    /// <summary>True for tasks produced by an automated generator; false for manually created tasks.</summary>
    public bool IsGenerated { get; set; } = false;

    /// <summary>
    /// Stable key used to prevent duplicate task creation across multiple fulfillment runs.
    /// For system rules mirrors SourceId.
    /// For booking tasks: "{sourceType}:{bookingId}:{slotIndex}".
    /// Null for manual tasks.
    /// </summary>
    public string? GenerationKey { get; set; }

    /// <summary>
    /// Points to the newer replacement task when this task has been superseded during
    /// regeneration.  Allows UI to navigate from an old task to its replacement.
    /// </summary>
    public Guid? SupersededByTaskId { get; set; }

    // ── Timestamps ────────────────────────────────────────────────────────────

    /// <summary>Set when the task transitions to <see cref="TaskStatus.Completed"/>.</summary>
    public DateTimeOffset? CompletedAt { get; set; }

    /// <summary>Set when the task transitions to <see cref="TaskStatus.Dismissed"/>.</summary>
    public DateTimeOffset? SkippedAt { get; set; }

    // ── Navigation ────────────────────────────────────────────────────────────

    public Family Family { get; set; } = null!;

    public ICollection<TaskEvent> Events { get; set; } = [];

    public SafetyTask? SupersededBy { get; set; }
}
