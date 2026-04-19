namespace SafeFamily.Api.Domain.Checklists;

/// <summary>
/// Describes when a safety task should be completed relative to its source event.
/// Used to group and prioritise tasks in the checklist UI.
/// </summary>
public enum SafeTaskPhase
{
    /// <summary>Must be actioned immediately (same day).</summary>
    Immediate   = 0,

    /// <summary>Should be completed within the next 7 days.</summary>
    Next7Days   = 1,

    /// <summary>Should be completed within the next 30 days.</summary>
    Next30Days  = 2,

    /// <summary>Ongoing or recurring habit — no specific deadline.</summary>
    Ongoing     = 3,
}
