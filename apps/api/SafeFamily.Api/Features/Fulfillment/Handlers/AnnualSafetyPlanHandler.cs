using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Checklists;
using SafeFamily.Api.Domain.Reports;
using SafeFamily.Api.Features.Tasks.Generation;

namespace SafeFamily.Api.Features.Fulfillment.Handlers;

/// <summary>
/// Fulfillment handler for the ANNUAL-PLAN package.
///
/// Produces an annual safety lifecycle report, six year-spanning checklist items
/// oriented around recurring digital hygiene habits, and a full set of phase-based
/// safety tasks via <see cref="AnnualSafetyPlanTaskRules"/>.
/// No new domain entity is created — the subscription artefact is represented
/// through the granted entitlements.
/// </summary>
public sealed class AnnualSafetyPlanHandler(
    AppDbContext db,
    ISafetyTaskGenerationService taskGenerationService) : IPackageFulfillmentHandler
{
    private static readonly (string title, string description, ChecklistCategory category, int priority)[] s_items =
    [
        (
            "Set up a password manager for the whole family",
            "A password manager generates and stores a unique, strong password for every account. " +
            "Start with your email — migrate one account per day until the whole family is covered.",
            ChecklistCategory.AccountSecurity, 1
        ),
        (
            "Enable two-factor authentication on all critical accounts",
            "Add a second layer to email, banking, social media, and any account containing financial or identity information. " +
            "Use an authenticator app (not SMS) wherever the service supports it.",
            ChecklistCategory.AccountSecurity, 1
        ),
        (
            "Enable screen lock and full-disk encryption on all devices",
            "Every phone, tablet, and laptop should require a PIN, password, or biometric to unlock. " +
            "Verify that encryption is enabled in device settings — on modern iOS it is automatic; " +
            "on Android check Settings › Security; on Windows use BitLocker.",
            ChecklistCategory.DeviceHygiene, 2
        ),
        (
            "Set up a 3-2-1 backup strategy for critical family files",
            "Keep three copies of important data — on the device, on an external drive, and in cloud storage. " +
            "Test that you can restore from your cloud backup at least once this year.",
            ChecklistCategory.BackupRecovery, 2
        ),
        (
            "Conduct a quarterly digital privacy audit",
            "Every three months: review app permissions on all devices, remove apps you no longer use, " +
            "check browser extensions, review public profile visibility on social accounts, " +
            "and rotate the passwords on your three most important accounts.",
            ChecklistCategory.PrivacySharing, 3
        ),
        (
            "Complete an annual scam awareness review with all family members",
            "Review the top current scam types together using your national consumer protection body's latest alerts. " +
            "Discuss what to do if targeted, agree on a code word for urgent requests, " +
            "and ensure everyone knows how to report suspicious activity.",
            ChecklistCategory.ScamReadiness, 3
        ),
    ];

    public async Task<TaskGenerationResult?> PrepareAsync(FulfillmentContext context, CancellationToken ct = default)
    {
        var booking = context.Booking;

        var memberCount  = context.FamilyPersons.Count;
        var memberClause = memberCount > 1
            ? $"all {memberCount} family members"
            : "your family";

        db.Reports.Add(new Report
        {
            FamilyId    = booking.FamilyId,
            BookingId   = booking.Id,
            ReportType  = ReportType.SafetyPlan,
            Title       = $"Annual Digital Safety Plan — {memberClause.Substring(0, 1).ToUpperInvariant() + memberClause.Substring(1)}",
            Description = $"Your annual digital safety plan covers the six pillars of family cyber wellness for {memberClause}. " +
                          "Complete each checklist item to build lasting protection that improves year-over-year. " +
                          "Your SafeFamily advisor will review your progress at each milestone.",
            FileUrl     = null,
            GeneratedAt = DateTimeOffset.UtcNow,
        });

        for (int i = 0; i < s_items.Length; i++)
        {
            var (title, description, category, priority) = s_items[i];
            AddItem(context, i + 1, title, description, category, priority);
        }

        // ── Phase-based safety task generation ───────────────────────────────
        // Generates quarterly, annual, ongoing, and gap-based tasks via
        // AnnualSafetyPlanTaskRules.SelectSpecs.

        var genContext = new TaskGenerationContext
        {
            FamilyId          = booking.FamilyId,
            BookingId         = booking.Id,
            Accounts          = context.Accounts,
            Devices           = context.Devices,
            FamilyPersons     = context.FamilyPersons,
            TriggeredByUserId = null,
        };

        var specs = AnnualSafetyPlanTaskRules.SelectSpecs(context, booking.Id);
        return await taskGenerationService.GenerateAsync(genContext, specs, ct);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void AddItem(
        FulfillmentContext context, int index,
        string title, string description,
        ChecklistCategory category, int priority)
    {
        var sourceId = $"annual-plan:{context.Booking.Id}:{index}";
        if (context.ExistingChecklistSourceIds.Contains(sourceId)) return;

        db.ChecklistItems.Add(new ChecklistItem
        {
            FamilyId        = context.Booking.FamilyId,
            Title           = title,
            Description     = description,
            Category        = category,
            Status          = ChecklistItemStatus.Pending,
            Priority        = priority,
            Phase           = SafeTaskPhase.Ongoing,
            SourceType      = ChecklistSourceType.AnnualPlan,
            SourceId        = sourceId,
            SourceBookingId = context.Booking.Id,
            IsPremium       = true,
        });
    }
}
