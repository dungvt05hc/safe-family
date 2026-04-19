using SafeFamily.Api.Domain.Entitlements;
using SafeFamily.Api.Features.Entitlements.Dtos;

namespace SafeFamily.Api.Features.Entitlements;

public interface IEntitlementService
{
    /// <summary>
    /// Grants a single entitlement to a family and persists the change.
    /// Does not deduplicate — callers must guard against granting the same
    /// entitlement twice if idempotency is required.
    /// </summary>
    Task GrantAsync(
        Guid            familyId,
        EntitlementType type,
        string          resourceType,
        Guid?           resourceId,
        DateTimeOffset? expiresAt,
        CancellationToken ct = default);

    /// <summary>
    /// Returns true if the family currently holds an active, unexpired entitlement
    /// of the specified type.
    /// </summary>
    Task<bool> HasEntitlementAsync(
        Guid            familyId,
        EntitlementType type,
        CancellationToken ct = default);

    /// <summary>
    /// Returns all entitlements (active and inactive) belonging to the family of
    /// the authenticated user, ordered newest-first.
    /// </summary>
    Task<IReadOnlyList<EntitlementResponse>> GetMyEntitlementsAsync(
        Guid userId,
        CancellationToken ct = default);
}
