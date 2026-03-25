using SafeFamily.Api.Domain.Common;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Domain.Checklists;

/// <summary>
/// A single actionable item in a family's digital safety checklist.
/// Items are auto-generated from account/device metadata and assessment results,
/// and reconciled on each fetch so resolved conditions are pruned automatically.
/// </summary>
public class ChecklistItem : BaseEntity
{
    public Guid FamilyId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public ChecklistCategory Category { get; set; }
    public ChecklistItemStatus Status { get; set; } = ChecklistItemStatus.Pending;

    /// <summary>1 = High, 2 = Medium, 3 = Low</summary>
    public int Priority { get; set; } = 2;

    public ChecklistSourceType SourceType { get; set; }

    /// <summary>
    /// Stable rule identifier used for deduplication during reconciliation,
    /// e.g. "acc-2fa:{accountId}" or "dev-screenlock:{deviceId}".
    /// </summary>
    public string? SourceId { get; set; }
    /// <summary>Optional due date for this checklist item.</summary>
    public DateTimeOffset? DueAt { get; set; }

    /// <summary>Optional URL linking to help documentation for this item.</summary>
    public string? HelpUrl { get; set; }
    // ── Navigation ────────────────────────────────────────────────────────────
    public Family Family { get; set; } = null!;
}
