using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Checklists;
using SafeFamily.Api.Domain.Reports;
using SafeFamily.Api.Features.Tasks.Generation;

namespace SafeFamily.Api.Features.Fulfillment.Handlers;

/// <summary>
/// Fulfillment handler for the FREE-CHECK package.
///
/// Produces:
/// <list type="bullet">
///   <item>A placeholder general safety report.</item>
///   <item>3 fixed beginner-friendly checklist items (always created).</item>
///   <item>Up to 3 personalised <see cref="Domain.Tasks.SafetyTask"/> instances selected
///         from the family's account and device data via <see cref="FreeCheckTaskRules"/>.</item>
/// </list>
///
/// The task generation step is idempotent: if the same protection gap was already surfaced
/// by system rule reconciliation, the engine refreshes or skips the existing task rather
/// than creating a duplicate.
/// </summary>
public sealed class FreeCheckHandler(
    AppDbContext db,
    ISafetyTaskGenerationService taskGenerationService)
    : IPackageFulfillmentHandler
{
    public async Task<TaskGenerationResult?> PrepareAsync(FulfillmentContext context, CancellationToken ct = default)
    {
        var booking = context.Booking;

        // ── Placeholder report ────────────────────────────────────────────────
        db.Reports.Add(new Report
        {
            FamilyId    = booking.FamilyId,
            BookingId   = booking.Id,
            ReportType  = ReportType.General,
            Title       = "Your Free Safety Check — In Preparation",
            Description = "Our advisors are reviewing your situation and personalising your free safety check report.",
            FileUrl     = null,
            GeneratedAt = DateTimeOffset.UtcNow,
        });

        // ── Fixed checklist items (always created, deduplication via SourceId) ─
        AddChecklistItem(context, 1,
            "Enable two-factor authentication on your primary email",
            "Adding a second verification step dramatically reduces the risk of account takeover.",
            ChecklistCategory.AccountSecurity, priority: 1);

        AddChecklistItem(context, 2,
            "Check whether your credentials have been leaked",
            "Visit haveibeenpwned.com and enter your email address to see if any passwords have been exposed in known data breaches.",
            ChecklistCategory.AccountSecurity, priority: 1);

        AddChecklistItem(context, 3,
            "Review which apps have access to your Google or Apple account",
            "Go to your account security settings and revoke any apps you no longer use or recognise.",
            ChecklistCategory.PrivacySharing, priority: 2);

        // ── Personalised safety tasks (up to 3, selected from account/device gaps) ─
        //
        // FreeCheckTaskRules.SelectTopSpecs evaluates the family's accounts and devices
        // against 7 weighted protection-gap rules and returns the top 3 specs.
        // If fewer than 3 rules fire (e.g. data is incomplete), generic fallback specs
        // fill the remaining slots — ensuring every free-check always produces 3 tasks.
        //
        // The generation engine then applies upsert semantics: it queries existing active
        // tasks by GenerationKey in a single DB round-trip, then creates, refreshes, or
        // skips each spec depending on whether an equivalent task already exists.
        var genContext = new TaskGenerationContext
        {
            FamilyId          = booking.FamilyId,
            BookingId         = booking.Id,
            Accounts          = context.Accounts,
            Devices           = context.Devices,
            FamilyPersons     = context.FamilyPersons,
            TriggeredByUserId = null, // system / automated fulfillment
        };

        var specs = FreeCheckTaskRules.SelectTopSpecs(context, booking.Id);
        return await taskGenerationService.GenerateAsync(genContext, specs, ct);
    }

    // ── Checklist item helper ─────────────────────────────────────────────────

    private void AddChecklistItem(
        FulfillmentContext context, int index,
        string title, string description,
        ChecklistCategory category, int priority,
        DateTimeOffset? dueAt = null)
    {
        var sourceId = $"free-check:{context.Booking.Id}:{index}";
        if (context.ExistingChecklistSourceIds.Contains(sourceId)) return;

        db.ChecklistItems.Add(new ChecklistItem
        {
            FamilyId        = context.Booking.FamilyId,
            Title           = title,
            Description     = description,
            Category        = category,
            Status          = ChecklistItemStatus.Pending,
            Priority        = priority,
            Phase           = SafeTaskPhase.Next7Days,
            SourceType      = ChecklistSourceType.FreeCheck,
            SourceId        = sourceId,
            SourceBookingId = context.Booking.Id,
            IsPremium       = false,
            DueAt           = dueAt,
        });
    }
}
