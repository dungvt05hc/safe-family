using SafeFamily.Api.Features.Plans.Dtos;

namespace SafeFamily.Api.Features.Plans;

public interface IPlansService
{
    // ── Family Safety Plan ────────────────────────────────────────────────────

    /// <summary>
    /// Returns all Family Safety Plans belonging to the user's family.
    /// Requires <c>FamilySafetyPlanAccess</c> entitlement.
    /// </summary>
    Task<IReadOnlyList<FamilySafetyPlanDto>> GetSafetyPlansAsync(
        Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Returns a single Family Safety Plan by its ID.
    /// Requires <c>FamilySafetyPlanAccess</c> entitlement.
    /// </summary>
    Task<FamilySafetyPlanDto> GetSafetyPlanByIdAsync(
        Guid userId, Guid planId, CancellationToken ct = default);

    // ── Incident Recovery Pack ────────────────────────────────────────────────

    /// <summary>
    /// Returns all Incident Recovery Packs belonging to the user's family.
    /// Requires <c>IncidentRecoveryPackAccess</c> entitlement.
    /// </summary>
    Task<IReadOnlyList<IncidentRecoveryPackDto>> GetIncidentRecoveryPacksAsync(
        Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Returns a single Incident Recovery Pack by its ID.
    /// Requires <c>IncidentRecoveryPackAccess</c> entitlement.
    /// </summary>
    Task<IncidentRecoveryPackDto> GetIncidentRecoveryPackByIdAsync(
        Guid userId, Guid packId, CancellationToken ct = default);
}
