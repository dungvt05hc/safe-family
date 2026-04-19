using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Entitlements;
using SafeFamily.Api.Features.Entitlements.Dtos;

namespace SafeFamily.Api.Features.Entitlements;

/// <summary>
/// Manages the lifecycle of digital entitlements — granting access to paid
/// products and verifying that access is still valid at query time.
/// </summary>
public sealed class EntitlementService(AppDbContext db) : IEntitlementService
{
    public async Task GrantAsync(
        Guid            familyId,
        EntitlementType type,
        string          resourceType,
        Guid?           resourceId,
        DateTimeOffset? expiresAt,
        CancellationToken ct = default)
    {
        var entitlement = new Entitlement
        {
            FamilyId        = familyId,
            EntitlementType = type,
            ResourceType    = resourceType,
            ResourceId      = resourceId,
            StartsAt        = DateTimeOffset.UtcNow,
            ExpiresAt       = expiresAt,
            IsActive        = true,
        };

        db.Entitlements.Add(entitlement);
        await db.SaveChangesAsync(ct);
    }

    public Task<bool> HasEntitlementAsync(
        Guid            familyId,
        EntitlementType type,
        CancellationToken ct = default)
    {
        var now = DateTimeOffset.UtcNow;

        return db.Entitlements.AnyAsync(
            e => e.FamilyId == familyId
              && e.EntitlementType == type
              && e.IsActive
              && e.StartsAt <= now
              && (e.ExpiresAt == null || e.ExpiresAt > now),
            ct);
    }

    public async Task<IReadOnlyList<EntitlementResponse>> GetMyEntitlementsAsync(
        Guid userId,
        CancellationToken ct = default)
    {
        var familyId = await db.FamilyMembers
            .Where(m => m.UserId == userId)
            .Select(m => (Guid?)m.FamilyId)
            .FirstOrDefaultAsync(ct);

        if (familyId is null)
            throw new ForbiddenException("You must be part of a family to view entitlements.");

        return await db.Entitlements
            .Where(e => e.FamilyId == familyId.Value)
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new EntitlementResponse(
                e.Id,
                e.FamilyId,
                e.UserId,
                e.EntitlementType,
                e.ResourceType,
                e.ResourceId,
                e.StartsAt,
                e.ExpiresAt,
                e.IsActive,
                e.CreatedAt))
            .ToListAsync(ct);
    }
}
