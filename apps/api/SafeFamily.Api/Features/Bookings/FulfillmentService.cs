using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Accounts;
using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Domain.Checklists;
using SafeFamily.Api.Domain.Devices;
using SafeFamily.Api.Domain.Entitlements;
using SafeFamily.Api.Features.Entitlements;
using SafeFamily.Api.Features.Fulfillment;
using SafeFamily.Api.Features.Fulfillment.Handlers;
using SafeFamily.Api.Features.Tasks.Generation;

namespace SafeFamily.Api.Features.Bookings;

/// <summary>
/// Orchestrates post-payment fulfillment by dispatching to a package-specific handler.
///
/// Responsibilities:
/// <list type="bullet">
///   <item>Idempotency guard — skips if <see cref="DeliveryStatus"/> is beyond Pending</item>
///   <item>Context assembly — loads assessment, family members, linked incident, and existing checklist source IDs</item>
///   <item>Handler dispatch — routes to the correct <see cref="IPackageFulfillmentHandler"/> based on package code</item>
///   <item>Persistence — single <c>SaveChangesAsync</c> after the handler has staged all changes</item>
///   <item>Entitlement granting — calls <see cref="IEntitlementService"/> after persistence</item>
/// </list>
/// </summary>
public sealed class FulfillmentService(
    AppDbContext db,
    IEntitlementService entitlementService,
    FreeCheckHandler freeCheckHandler,
    FamilySafetyPlanHandler familySafetyPlanHandler,
    IncidentRecoveryPackHandler incidentRecoveryPackHandler,
    AnnualSafetyPlanHandler annualSafetyPlanHandler,
    GenericPackageHandler genericPackageHandler,
    ILogger<FulfillmentService> logger)
    : IFulfillmentService
{
    public async Task TriggerAsync(Booking booking, CancellationToken ct = default)
    {
        // Idempotency guard — covers duplicate webhook deliveries and sync-path races.
        if (booking.DeliveryStatus != DeliveryStatus.Pending)
        {
            logger.LogInformation(
                "Fulfillment skipped for booking {BookingId}: already in {Status}",
                booking.Id, booking.DeliveryStatus);
            return;
        }

        var code    = booking.SnapshotPackageCode?.ToUpperInvariant() ?? string.Empty;
        var context = await BuildContextAsync(booking, ct);
        var handler = ResolveHandler(code);

        // ── Handler dispatch ───────────────────────────────────────────────────
        // Handler stages entities in the EF change tracker — no SaveChanges inside handlers.
        // On failure, clear staged changes, mark booking as Failed, and persist that alone.
        TaskGenerationResult? taskResult;
        try
        {
            taskResult = await handler.PrepareAsync(context, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex,
                "Fulfillment handler {Handler} threw for booking {BookingId} (package {Code}).",
                handler.GetType().Name, booking.Id, code);

            // Clear any partially-staged entities so we only write the failure status.
            db.ChangeTracker.Clear();
            db.Bookings.Attach(booking);
            booking.DeliveryStatus = DeliveryStatus.Failed;

            db.BookingEvents.Add(new BookingEvent
            {
                BookingId   = booking.Id,
                EventType   = BookingEventTypes.FulfillmentFailed,
                Description = $"Fulfillment failed for package '{code}' in {handler.GetType().Name}: {ex.Message}",
            });

            try   { await db.SaveChangesAsync(ct); }
            catch (Exception saveEx)
            {
                logger.LogError(saveEx,
                    "Could not persist DeliveryStatus.Failed for booking {BookingId}.", booking.Id);
            }
            return;
        }

        // ── Persist all staged changes atomically ──────────────────────────────
        var taskSummary = taskResult is null
            ? string.Empty
            : $" Tasks: {taskResult.CreatedCount} created, {taskResult.RefreshedCount} refreshed, {taskResult.SkippedCount} skipped.";

        booking.DeliveryStatus = DeliveryStatus.Processing;

        db.BookingEvents.Add(new BookingEvent
        {
            BookingId   = booking.Id,
            EventType   = BookingEventTypes.FulfillmentTriggered,
            Description = $"Package '{code}' fulfillment prepared by {handler.GetType().Name}.{taskSummary}",
        });

        await db.SaveChangesAsync(ct);

        await GrantEntitlementsAsync(booking, code, ct);

        logger.LogInformation(
            "Fulfillment completed for booking {BookingId} (package {Code}) via {Handler}." +
            " Tasks: {Created}C/{Refreshed}R/{Skipped}S.",
            booking.Id, code, handler.GetType().Name,
            taskResult?.CreatedCount ?? 0,
            taskResult?.RefreshedCount ?? 0,
            taskResult?.SkippedCount ?? 0);
    }

    // ── Context assembly ──────────────────────────────────────────────────────

    private async Task<FulfillmentContext> BuildContextAsync(Booking booking, CancellationToken ct)
    {
        // Load the most recent completed assessment for this family (prefer the one linked
        // to this booking via SourceAssessmentId but fall back to latest by date).
        var assessmentQuery = db.Assessments
            .Where(a => a.FamilyId == booking.FamilyId);

        var assessment = booking.SourceAssessmentId.HasValue
            ? await assessmentQuery
                .FirstOrDefaultAsync(a => a.Id == booking.SourceAssessmentId.Value, ct)
              ?? await assessmentQuery
                .OrderByDescending(a => a.CreatedAt)
                .FirstOrDefaultAsync(ct)
            : await assessmentQuery
                .OrderByDescending(a => a.CreatedAt)
                .FirstOrDefaultAsync(ct);

        // Non-archived family members, primary contact first.
        var members = await db.FamilyPersons
            .Where(p => p.FamilyId == booking.FamilyId && p.ArchivedAt == null)
            .OrderByDescending(p => p.IsPrimaryContact)
            .ThenBy(p => p.DisplayName)
            .ToListAsync(ct);

        // Linked incident (for INCIDENT-RESP packages).
        var incident = booking.SourceIncidentId.HasValue
            ? await db.Incidents
                .FirstOrDefaultAsync(i => i.Id == booking.SourceIncidentId.Value, ct)
            : null;

        // Pre-load existing checklist source IDs to enable idempotent item creation.
        // Covers all booking-sourced types (FreeCheck, FamilySafetyPlan, IncidentRecoveryPack, AnnualPlan, Manual).
        var bookingSourceTypes = new[]
        {
            ChecklistSourceType.FreeCheck,
            ChecklistSourceType.FamilySafetyPlan,
            ChecklistSourceType.IncidentRecoveryPack,
            ChecklistSourceType.AnnualPlan,
            ChecklistSourceType.Manual,
        };
        var existingIds = await db.ChecklistItems
            .Where(i => i.FamilyId == booking.FamilyId
                     && bookingSourceTypes.Contains(i.SourceType))
            .Select(i => i.SourceId)
            .ToListAsync(ct);

        // Active accounts and devices — used by task generation rules in handlers.
        var accounts = await db.Accounts
            .Where(a => a.FamilyId == booking.FamilyId && a.ArchivedAt == null)
            .ToListAsync(ct);

        var devices = await db.Devices
            .Where(d => d.FamilyId == booking.FamilyId && d.ArchivedAt == null)
            .ToListAsync(ct);

        return new FulfillmentContext(
            Booking: booking,
            LatestAssessment: assessment,
            FamilyPersons: members,
            LinkedIncident: incident,
            ExistingChecklistSourceIds: new HashSet<string?>(existingIds),
            Accounts: accounts,
            Devices: devices);
    }

    // ── Handler resolution ────────────────────────────────────────────────────

    private IPackageFulfillmentHandler ResolveHandler(string code) => code switch
    {
        "FREE-CHECK"    => freeCheckHandler,
        "FAMILY-CORE"   => familySafetyPlanHandler,
        "INCIDENT-RESP" => incidentRecoveryPackHandler,
        "ANNUAL-PLAN"   => annualSafetyPlanHandler,
        _               => genericPackageHandler,
    };

    // ── Entitlement granting ──────────────────────────────────────────────────

    private async Task GrantEntitlementsAsync(Booking booking, string code, CancellationToken ct)
    {
        var familyId   = booking.FamilyId;
        var resourceId = booking.Id;
        const string resourceType = "Booking";

        var oneYear    = DateTimeOffset.UtcNow.AddYears(1);
        var thirtyDays = DateTimeOffset.UtcNow.AddDays(30);

        switch (code)
        {
            case "FREE-CHECK":
                await entitlementService.GrantAsync(
                    familyId, EntitlementType.PremiumChecklistAccess,
                    resourceType, resourceId, thirtyDays, ct);
                break;

            case "FAMILY-CORE":
                await entitlementService.GrantAsync(
                    familyId, EntitlementType.FamilySafetyPlanAccess,
                    resourceType, resourceId, oneYear, ct);
                await entitlementService.GrantAsync(
                    familyId, EntitlementType.PremiumChecklistAccess,
                    resourceType, resourceId, oneYear, ct);
                await entitlementService.GrantAsync(
                    familyId, EntitlementType.PremiumReportAccess,
                    resourceType, resourceId, oneYear, ct);
                break;

            case "INCIDENT-RESP":
                await entitlementService.GrantAsync(
                    familyId, EntitlementType.IncidentRecoveryPackAccess,
                    resourceType, resourceId, oneYear, ct);
                await entitlementService.GrantAsync(
                    familyId, EntitlementType.PremiumReportAccess,
                    resourceType, resourceId, oneYear, ct);
                break;

            case "ANNUAL-PLAN":
                await entitlementService.GrantAsync(
                    familyId, EntitlementType.AnnualPlanSubscription,
                    resourceType, resourceId, oneYear, ct);
                await entitlementService.GrantAsync(
                    familyId, EntitlementType.FamilySafetyPlanAccess,
                    resourceType, resourceId, oneYear, ct);
                await entitlementService.GrantAsync(
                    familyId, EntitlementType.IncidentRecoveryPackAccess,
                    resourceType, resourceId, oneYear, ct);
                await entitlementService.GrantAsync(
                    familyId, EntitlementType.PremiumChecklistAccess,
                    resourceType, resourceId, oneYear, ct);
                await entitlementService.GrantAsync(
                    familyId, EntitlementType.PremiumReportAccess,
                    resourceType, resourceId, oneYear, ct);
                break;

            default:
                // Generic / unknown packages receive no entitlements.
                break;
        }
    }
}
