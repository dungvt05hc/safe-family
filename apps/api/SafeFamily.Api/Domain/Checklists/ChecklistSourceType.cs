namespace SafeFamily.Api.Domain.Checklists;

/// <summary>
/// Identifies which product or signal generated a safety task.
/// Used for source filtering, premium gating, and UI labelling.
/// </summary>
public enum ChecklistSourceType
{
    /// <summary>Auto-generated from account metadata (2FA, recovery options, suspicious activity).</summary>
    Account            = 1,

    /// <summary>Auto-generated from device metadata (screen lock, backup, support status).</summary>
    Device             = 2,

    /// <summary>Manually created by a family member or advisor.</summary>
    Manual             = 3,

    /// <summary>Generated from a Free Safety Check booking.</summary>
    FreeCheck          = 5,

    /// <summary>Generated from a Family Safety Plan booking.</summary>
    FamilySafetyPlan   = 6,

    /// <summary>Generated from an Incident Recovery Pack booking.</summary>
    IncidentRecoveryPack = 7,

    /// <summary>Generated from an Annual Safety Plan subscription.</summary>
    AnnualPlan         = 8,
}
