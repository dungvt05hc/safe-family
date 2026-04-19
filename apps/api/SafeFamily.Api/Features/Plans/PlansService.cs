using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Entitlements;
using SafeFamily.Api.Domain.Incidents;
using SafeFamily.Api.Domain.Plans;
using SafeFamily.Api.Features.Entitlements;
using SafeFamily.Api.Features.Plans.Dtos;

namespace SafeFamily.Api.Features.Plans;

/// <summary>
/// Serves Family Safety Plans and Incident Recovery Packs to authenticated users,
/// enforcing entitlement checks before any plan content is returned.
/// </summary>
public sealed class PlansService(AppDbContext db, IEntitlementService entitlementService) : IPlansService
{
    // ── Family Safety Plan ────────────────────────────────────────────────────

    public async Task<IReadOnlyList<FamilySafetyPlanDto>> GetSafetyPlansAsync(
        Guid userId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);
        await RequireEntitlementAsync(familyId, EntitlementType.FamilySafetyPlanAccess,
            "Family Safety Plan", ct);

        var plans = await db.FamilySafetyPlans
            .Where(p => p.FamilyId == familyId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

        return plans.Select(ToSafetyPlanDto).ToList();
    }

    public async Task<FamilySafetyPlanDto> GetSafetyPlanByIdAsync(
        Guid userId, Guid planId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);
        await RequireEntitlementAsync(familyId, EntitlementType.FamilySafetyPlanAccess,
            "Family Safety Plan", ct);

        var plan = await db.FamilySafetyPlans
            .FirstOrDefaultAsync(p => p.Id == planId && p.FamilyId == familyId, ct)
            ?? throw new NotFoundException("FamilySafetyPlan", planId);

        return ToSafetyPlanDto(plan);
    }

    // ── Incident Recovery Pack ────────────────────────────────────────────────

    public async Task<IReadOnlyList<IncidentRecoveryPackDto>> GetIncidentRecoveryPacksAsync(
        Guid userId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);
        await RequireEntitlementAsync(familyId, EntitlementType.IncidentRecoveryPackAccess,
            "Incident Recovery Pack", ct);

        var packs = await db.IncidentRecoveryPacks
            .Where(p => p.FamilyId == familyId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

        return packs.Select(ToIncidentPackDto).ToList();
    }

    public async Task<IncidentRecoveryPackDto> GetIncidentRecoveryPackByIdAsync(
        Guid userId, Guid packId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);
        await RequireEntitlementAsync(familyId, EntitlementType.IncidentRecoveryPackAccess,
            "Incident Recovery Pack", ct);

        var pack = await db.IncidentRecoveryPacks
            .FirstOrDefaultAsync(p => p.Id == packId && p.FamilyId == familyId, ct)
            ?? throw new NotFoundException("IncidentRecoveryPack", packId);

        return ToIncidentPackDto(pack);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<Guid> RequireFamilyIdAsync(Guid userId, CancellationToken ct)
    {
        var familyId = await db.FamilyMembers
            .Where(m => m.UserId == userId)
            .Select(m => (Guid?)m.FamilyId)
            .FirstOrDefaultAsync(ct);

        if (familyId is null)
            throw new ForbiddenException("You must be part of a family to access plans.");

        return familyId.Value;
    }

    private async Task RequireEntitlementAsync(
        Guid familyId, EntitlementType type,
        string productName, CancellationToken ct)
    {
        var hasAccess = await entitlementService.HasEntitlementAsync(familyId, type, ct);
        if (!hasAccess)
            throw new EntitlementRequiredException(productName, type.ToString());
    }

    private static FamilySafetyPlanDto ToSafetyPlanDto(FamilySafetyPlan p) =>
        new(p.Id,
            p.FamilyId,
            p.BookingId,
            p.SourceAssessmentId,
            p.AssessmentOverallScore,
            p.AssessmentRiskLevel,
            p.TopRisks,
            p.TopPriorities,
            p.ActionPlanByMember,
            p.ActionPlanByDevice,
            p.Status.ToString(),
            p.CreatedAt,
            p.UpdatedAt);

    private static IncidentRecoveryPackDto ToIncidentPackDto(IncidentRecoveryPack p) =>
        new(p.Id,
            p.FamilyId,
            p.BookingId,
            p.LinkedIncidentId,
            p.WhatHappened,
            p.WhatToDoNow,
            p.WhatNotToDo,
            p.Next24Hours,
            p.Next7Days,
            p.Status.ToString(),
            p.CreatedAt,
            p.UpdatedAt);
}
