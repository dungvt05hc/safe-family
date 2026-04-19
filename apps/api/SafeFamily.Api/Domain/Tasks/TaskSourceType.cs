namespace SafeFamily.Api.Domain.Tasks;

/// <summary>
/// Identifies which product or system signal produced a safety task.
/// Stored as a string for readability and migration safety.
/// </summary>
public enum TaskSourceType
{
    /// <summary>Auto-generated from account metadata (2FA, recovery options, suspicious activity).</summary>
    AccountRule          = 1,

    /// <summary>Auto-generated from device metadata (screen lock, backup, support status).</summary>
    DeviceRule           = 2,

    /// <summary>Generated from a Free Safety Check booking.</summary>
    FreeCheck            = 3,

    /// <summary>Generated from a Family Safety Plan booking.</summary>
    FamilySafetyPlan     = 4,

    /// <summary>Generated from an Incident Recovery Pack booking.</summary>
    IncidentRecoveryPack = 5,

    /// <summary>Generated from an Annual Safety Plan subscription booking.</summary>
    AnnualPlan           = 6,

    /// <summary>Created manually by a family member or SafeFamily advisor.</summary>
    Manual               = 7,
}
