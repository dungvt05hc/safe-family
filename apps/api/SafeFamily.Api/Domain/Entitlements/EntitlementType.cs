namespace SafeFamily.Api.Domain.Entitlements;

/// <summary>
/// Discriminates what digital product a family has been granted access to.
/// Stored as a string in the database for readability and migration safety.
/// </summary>
public enum EntitlementType
{
    FamilySafetyPlanAccess     = 0,
    IncidentRecoveryPackAccess = 1,
    PremiumChecklistAccess     = 2,
    PremiumReportAccess        = 3,
    AnnualPlanSubscription     = 4,
    PremiumTasksAccess         = 5,
}
