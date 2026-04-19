using SafeFamily.Api.Domain.Common;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Domain.Checklists;

/// <summary>
/// A single actionable safety task in a family's digital safety checklist.
///
/// Tasks can originate from multiple sources (free check, family safety plan,
/// incident recovery pack, annual plan, account/device system rules).
/// Items are reconciled on each fetch — resolved account/device conditions are
/// pruned automatically; booking-sourced tasks persist until manually actioned.
/// </summary>
public class ChecklistItem : BaseEntity
{
    public Guid FamilyId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // ── Classification ────────────────────────────────────────────────────────

    public ChecklistCategory Category { get; set; }
    public ChecklistItemStatus Status { get; set; } = ChecklistItemStatus.Pending;

    /// <summary>1 = High, 2 = Medium, 3 = Low</summary>
    public int Priority { get; set; } = 2;

    /// <summary>Lifecycle phase for this task (Immediate, Next7Days, Next30Days, Ongoing).</summary>
    public SafeTaskPhase Phase { get; set; } = SafeTaskPhase.Ongoing;

    // ── Source tracking ───────────────────────────────────────────────────────

    public ChecklistSourceType SourceType { get; set; }

    /// <summary>
    /// Stable rule identifier used for deduplication during reconciliation,
    /// e.g. "acc-2fa:{accountId}", "free-check:{bookingId}:1", "family-plan:{bookingId}:2".
    /// </summary>
    public string? SourceId { get; set; }

    /// <summary>
    /// The booking that triggered this task, when the source is a product
    /// (FreeCheck, FamilySafetyPlan, IncidentRecoveryPack, AnnualPlan).
    /// </summary>
    public Guid? SourceBookingId { get; set; }

    // ── Target tracking ───────────────────────────────────────────────────────

    /// <summary>
    /// The type of domain object this task is directed at.
    /// Defaults to Family (whole-family guidance).
    /// </summary>
    public SafeTaskTargetType TargetType { get; set; } = SafeTaskTargetType.Family;

    /// <summary>
    /// The ID of the specific target entity (FamilyMember, Device, or Account).
    /// Null when TargetType is Family.
    /// </summary>
    public Guid? TargetId { get; set; }

    /// <summary>
    /// Human-readable label for the target shown in the UI, e.g. "John's iPhone 15 Pro".
    /// Snapshot captured at task creation so renames don't break display.
    /// </summary>
    public string? TargetLabel { get; set; }

    // ── Content ───────────────────────────────────────────────────────────────

    /// <summary>Optional due date for this task.</summary>
    public DateTimeOffset? DueAt { get; set; }

    /// <summary>Optional URL linking to help documentation for this task.</summary>
    public string? HelpUrl { get; set; }

    /// <summary>
    /// Extended step-by-step guidance text, populated for booking-sourced tasks.
    /// Null for auto-generated account/device rule items.
    /// </summary>
    public string? Guidance { get; set; }

    // ── Premium gating ────────────────────────────────────────────────────────

    /// <summary>
    /// When true, this task is only visible to families with a premium entitlement.
    /// Free-check tasks are not premium; all other booking-sourced tasks are.
    /// </summary>
    public bool IsPremium { get; set; } = false;

    // ── Regeneration control ──────────────────────────────────────────────────

    /// <summary>
    /// When true the task will be included in the next reconciliation pass even
    /// if no newer booking supersedes it.  Set to true by the regeneration endpoint.
    /// </summary>
    public bool RegenerationRequested { get; set; } = false;

    // ── Navigation ────────────────────────────────────────────────────────────
    public Family Family { get; set; } = null!;
}

