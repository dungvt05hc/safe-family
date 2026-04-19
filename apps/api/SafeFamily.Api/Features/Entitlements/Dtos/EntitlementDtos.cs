using SafeFamily.Api.Domain.Entitlements;

namespace SafeFamily.Api.Features.Entitlements.Dtos;

/// <summary>Response DTO returned by all entitlement endpoints.</summary>
public record EntitlementResponse(
    Guid            Id,
    Guid            FamilyId,
    Guid?           UserId,
    EntitlementType EntitlementType,
    string          ResourceType,
    Guid?           ResourceId,
    DateTimeOffset  StartsAt,
    DateTimeOffset? ExpiresAt,
    bool            IsActive,
    DateTimeOffset  CreatedAt);
