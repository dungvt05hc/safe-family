using SafeFamily.Api.Domain.Common;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Domain.Entitlements;

/// <summary>
/// Records that a family (or a specific member) has been granted the right to
/// access a particular digital product for a defined period.
///
/// Family-level entitlements (UserId = null) apply to every member of the family.
/// User-level entitlements can be used for per-member restrictions in the future.
/// </summary>
public class Entitlement : AuditableEntity
{
    /// <summary>The family that holds this entitlement.</summary>
    public Guid FamilyId { get; set; }

    /// <summary>
    /// Optional: scopes the entitlement to a specific family member.
    /// Null means the entitlement is valid for the whole family.
    /// </summary>
    public Guid? UserId { get; set; }

    /// <summary>What digital product has been unlocked.</summary>
    public EntitlementType EntitlementType { get; set; }

    /// <summary>
    /// The domain entity type that sourced the grant (e.g. "Booking").
    /// Kept as a string so it remains human-readable in the DB without
    /// introducing a dependency on the source domain.
    /// </summary>
    public string ResourceType { get; set; } = string.Empty;

    /// <summary>
    /// The ID of the source entity (e.g. the Booking.Id that triggered the grant).
    /// Null for manually issued entitlements.
    /// </summary>
    public Guid? ResourceId { get; set; }

    /// <summary>UTC timestamp from which the entitlement is active.</summary>
    public DateTimeOffset StartsAt { get; set; }

    /// <summary>UTC timestamp at which the entitlement expires. Null = never.</summary>
    public DateTimeOffset? ExpiresAt { get; set; }

    /// <summary>
    /// False means the entitlement has been manually revoked before its natural expiry.
    /// </summary>
    public bool IsActive { get; set; } = true;

    // ── Navigation ─────────────────────────────────────────────────────────────

    public Family Family { get; set; } = null!;
}
