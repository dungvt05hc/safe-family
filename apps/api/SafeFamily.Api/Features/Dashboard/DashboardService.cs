using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Assessments;
using SafeFamily.Api.Domain.Checklists;
using SafeFamily.Api.Features.Dashboard.Dtos;

namespace SafeFamily.Api.Features.Dashboard;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _db;

    public DashboardService(AppDbContext db)
    {
        _db = db;
    }

    /// <inheritdoc />
    public async Task<DashboardResponse> GetDashboardAsync(Guid userId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var family = await _db.Families
            .FirstOrDefaultAsync(f => f.Id == familyId, ct)
            ?? throw new NotFoundException("Family", familyId);

        var memberCount = await _db.FamilyMembers
            .CountAsync(m => m.FamilyId == familyId, ct);

        var accountCount = await _db.Accounts
            .CountAsync(a => a.FamilyId == familyId, ct);

        var deviceCount = await _db.Devices
            .CountAsync(d => d.FamilyId == familyId, ct);

        var pendingChecklistCount = await _db.ChecklistItems
            .CountAsync(i => i.FamilyId == familyId && i.Status == ChecklistItemStatus.Pending, ct);

        var topPendingItems = await _db.ChecklistItems
            .Where(i => i.FamilyId == familyId && i.Status == ChecklistItemStatus.Pending)
            .OrderBy(i => i.Priority)
            .ThenByDescending(i => i.CreatedAt)
            .Take(5)
            .Select(i => new TopChecklistItemDto(i.Id, i.Title, i.Category.ToString(), i.Priority))
            .ToListAsync(ct);

        var latestAssessment = await _db.Assessments
            .Where(a => a.FamilyId == familyId)
            .OrderByDescending(a => a.CreatedAt)
            .FirstOrDefaultAsync(ct);

        var riskSummary = latestAssessment is null
            ? new RiskSummaryDto(null, null, null)
            : new RiskSummaryDto(
                latestAssessment.OverallScore,
                latestAssessment.RiskLevel.ToString(),
                latestAssessment.CreatedAt);

        var immediateActions = latestAssessment is null
            ? Array.Empty<string>()
            : BuildImmediateActions(latestAssessment);

        return new DashboardResponse(
            Family: new FamilySummaryDto(family.Id, family.DisplayName, family.CountryCode, family.Timezone),
            RiskSummary: riskSummary,
            Counts: new CountsSummaryDto(memberCount, accountCount, deviceCount, pendingChecklistCount),
            ImmediateActions: immediateActions,
            TopPendingItems: topPendingItems);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<Guid> RequireFamilyIdAsync(Guid userId, CancellationToken ct)
    {
        var familyId = await _db.FamilyMembers
            .Where(m => m.UserId == userId)
            .Select(m => (Guid?)m.FamilyId)
            .FirstOrDefaultAsync(ct);

        if (familyId is null)
            throw new ForbiddenException("You must be part of a family to view the dashboard.");

        return familyId.Value;
    }

    private static IReadOnlyList<string> BuildImmediateActions(Assessment assessment)
    {
        var actions = new List<string>();

        if (assessment.AccountSecurityScore < 50)
            actions.Add("Review and strengthen security on all important accounts — enable 2FA and use a password manager.");
        if (assessment.DeviceHygieneScore < 50)
            actions.Add("Update all devices to the latest OS version and enable screen lock and Find My Device features.");
        if (assessment.BackupRecoveryScore < 50)
            actions.Add("Set up regular automated backups stored in at least two locations (local + cloud).");
        if (assessment.PrivacySharingScore < 50)
            actions.Add("Review privacy settings on social media and limit location sharing to essential apps only.");
        if (assessment.ScamReadinessScore < 50)
            actions.Add("Educate your family about phishing and scams, and create a simple incident response plan.");

        return actions.Take(5).ToList();
    }
}
