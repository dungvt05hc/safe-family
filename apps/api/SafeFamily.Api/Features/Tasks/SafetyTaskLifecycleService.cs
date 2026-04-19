using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Assessments;
using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Domain.Incidents;
using SafeFamily.Api.Domain.Tasks;
using SafeFamily.Api.Features.Fulfillment;
using SafeFamily.Api.Features.Tasks.Generation;
using TaskStatus = SafeFamily.Api.Domain.Tasks.TaskStatus;

namespace SafeFamily.Api.Features.Tasks;

/// <summary>
/// Implements <see cref="ISafetyTaskLifecycleService"/>.
///
/// Coordinates between the rule modules (<see cref="FamilySafetyPlanTaskRules"/>,
/// <see cref="IncidentRecoveryPackTaskRules"/>, <see cref="AnnualSafetyPlanTaskRules"/>)
/// and the generation engine (<see cref="ISafetyTaskGenerationService"/>) to apply the
/// correct strategy for each lifecycle trigger:
///
/// <list type="table">
///   <listheader><term>Trigger</term><term>Strategy</term></listheader>
///   <item><term>New assessment</term><term>GenerateAsync (in-place refresh; no supersession)</term></item>
///   <item><term>Incident active</term><term>GenerateAsync (content refresh preserving progress)</term></item>
///   <item><term>Incident resolved</term><term>Dismiss pending tasks</term></item>
///   <item><term>Annual cycle</term><term>RegenerateAsync for Recurring specs; GenerateAsync for others</term></item>
///   <item><term>Entity archived</term><term>Dismiss tasks targeting that entity</term></item>
/// </list>
/// </summary>
public sealed class SafetyTaskLifecycleService : ISafetyTaskLifecycleService
{
    private readonly AppDbContext _db;
    private readonly ISafetyTaskGenerationService _generator;
    private readonly ILogger<SafetyTaskLifecycleService> _logger;

    public SafetyTaskLifecycleService(
        AppDbContext db,
        ISafetyTaskGenerationService generator,
        ILogger<SafetyTaskLifecycleService> logger)
    {
        _db        = db;
        _generator = generator;
        _logger    = logger;
    }

    // ── RegenerateForAssessmentAsync ──────────────────────────────────────────

    /// <inheritdoc />
    public async Task<TaskGenerationResult> RegenerateForAssessmentAsync(
        Guid familyId,
        Guid assessmentId,
        Guid? triggeredByUserId,
        CancellationToken ct = default)
    {
        // Load the specific assessment that just completed.
        var assessment = await _db.Assessments
            .FirstOrDefaultAsync(a => a.Id == assessmentId && a.FamilyId == familyId, ct);

        if (assessment is null)
        {
            _logger.LogWarning(
                "RegenerateForAssessment: assessment {AssessmentId} not found for family {FamilyId}.",
                assessmentId, familyId);
            return EmptyResult();
        }

        // Find all FAMILY-CORE and ANNUAL-PLAN bookings that have been delivered.
        // Both product types generate assessment-driven tasks that need refreshing.
        var bookings = await _db.Bookings
            .Where(b =>
                b.FamilyId == familyId &&
                b.DeliveryStatus == DeliveryStatus.Delivered &&
                (b.SnapshotPackageCode == "FAMILY-CORE" || b.SnapshotPackageCode == "ANNUAL-PLAN"))
            .ToListAsync(ct);

        if (bookings.Count == 0)
            return EmptyResult();

        var combined = EmptyResult();

        foreach (var booking in bookings)
        {
            var ctx      = await BuildContextAsync(booking, assessment, ct);
            var genCtx   = MakeGenCtx(familyId, triggeredByUserId, booking.Id);
            var specs    = booking.SnapshotPackageCode == "FAMILY-CORE"
                ? FamilySafetyPlanTaskRules.SelectSpecs(ctx, booking.Id)
                : AnnualSafetyPlanTaskRules.SelectSpecs(ctx, booking.Id);

            // In-place refresh: ContentChanged logic updates priority/phase if scores shift.
            // Completed and dismissed tasks are recreated by the engine if the rule re-fires.
            var result = await _generator.GenerateAsync(genCtx, specs, ct);
            combined = Merge(combined, result);

            // Dismiss booking-position tasks that no longer match any spec in the new set.
            // This handles score improvements where a category task was emitted before but
            // the score has now crossed the 75 threshold and the task should no longer exist.
            //
            // Example: "Improve Privacy Score" task existed when PrivacySharingScore was 60.
            // After this assessment PrivacySharingScore = 82 → task is not in new spec set
            // → dismissed with "Dismissed by system: score target met after assessment update".
            var slug   = booking.SnapshotPackageCode == "FAMILY-CORE"
                ? GenerationKeyStrategy.ProductSlugFamilySafetyPlan
                : GenerationKeyStrategy.ProductSlugAnnualPlan;
            var prefix = BookingKeyPrefix(slug, booking.Id);
            var expectedKeys = specs.Select(s => s.GenerationKey).ToHashSet(StringComparer.Ordinal);

            await DismissOrphanBookingKeysAsync(
                familyId, prefix, expectedKeys, triggeredByUserId, ct);
        }

        await _db.SaveChangesAsync(ct);

        _logger.LogInformation(
            "RegenerateForAssessment [{AssessmentId}] family {FamilyId}: " +
            "C={Created} R={Refreshed} S={Skipped} Sup={Superseded}",
            assessmentId, familyId,
            combined.CreatedCount, combined.RefreshedCount,
            combined.SkippedCount, combined.SupersededCount);

        return combined;
    }

    // ── RegenerateForIncidentAsync ────────────────────────────────────────────

    /// <inheritdoc />
    public async Task<TaskGenerationResult> RegenerateForIncidentAsync(
        Guid incidentId,
        Guid? triggeredByUserId,
        CancellationToken ct = default)
    {
        var incident = await _db.Incidents.FindAsync([incidentId], ct);
        if (incident is null)
        {
            _logger.LogWarning("RegenerateForIncident: incident {IncidentId} not found.", incidentId);
            return EmptyResult();
        }

        // Find all INCIDENT-RESP bookings linked to this incident that have been fulfilled.
        // A family may have purchased more than one IRP (e.g. separate incidents over time),
        // so we scope strictly to bookings with SourceIncidentId = this incident.
        var bookings = await _db.Bookings
            .Where(b =>
                b.SourceIncidentId == incidentId &&
                b.SnapshotPackageCode == "INCIDENT-RESP" &&
                b.DeliveryStatus == DeliveryStatus.Delivered)
            .ToListAsync(ct);

        if (bookings.Count == 0)
            return EmptyResult();

        if (incident.Status is IncidentStatus.Resolved or IncidentStatus.Dismissed)
        {
            // ── Incident closed: dismiss all outstanding IRP tasks ─────────────
            // Completed tasks are preserved as a historical record of work done.
            // Example: Family resolved a PasswordCompromise incident → the 8 remaining
            // Pending tasks are dismissed; the 4 tasks they already Completed are left intact.
            int dismissed = 0;
            foreach (var booking in bookings)
            {
                var pending = await _db.SafetyTasks
                    .Where(t =>
                        t.FamilyId == incident.FamilyId &&
                        t.SourceType == TaskSourceType.IncidentRecoveryPack &&
                        t.SourceId == booking.Id.ToString("N") &&
                        t.SupersededByTaskId == null &&
                        (t.Status == TaskStatus.Pending || t.Status == TaskStatus.InProgress))
                    .ToListAsync(ct);

                foreach (var task in pending)
                {
                    DismissTask(
                        task,
                        $"Incident {incidentId:D} is now {incident.Status} — outstanding tasks dismissed.",
                        triggeredByUserId);
                    dismissed++;
                }
            }

            await _db.SaveChangesAsync(ct);

            _logger.LogInformation(
                "RegenerateForIncident [{IncidentId}] resolved — dismissed {Count} pending tasks.",
                incidentId, dismissed);

            return EmptyResult();
        }

        // ── Incident active: refresh task content ──────────────────────────────
        // Uses GenerateAsync (not RegenerateAsync) so that tasks already completed or in
        // progress by the family are NOT superseded — their work is preserved.
        // ContentChanged() detects any priority / guidance update from severity changes
        // and applies an in-place refresh.
        //
        // Example: PhishingAttempt incident started at Medium → 12 tasks with Medium priority.
        // Admin updates status to InProgress and notes severity is actually High.
        // RegenerateForIncident fires → tasks refreshed in-place with High priority guidance.
        var combined = EmptyResult();

        foreach (var booking in bookings)
        {
            var ctx    = await BuildContextAsync(booking, latestAssessment: null, ct);
            var genCtx = MakeGenCtx(incident.FamilyId, triggeredByUserId, booking.Id, incidentId);
            var specs  = IncidentRecoveryPackTaskRules.SelectSpecs(ctx, booking.Id);

            var result = await _generator.GenerateAsync(genCtx, specs, ct);
            combined = Merge(combined, result);
        }

        await _db.SaveChangesAsync(ct);

        _logger.LogInformation(
            "RegenerateForIncident [{IncidentId}]: " +
            "C={Created} R={Refreshed} S={Skipped}",
            incidentId,
            combined.CreatedCount, combined.RefreshedCount, combined.SkippedCount);

        return combined;
    }

    // ── RefreshAnnualPlanAsync ────────────────────────────────────────────────

    /// <inheritdoc />
    public async Task<TaskGenerationResult> RefreshAnnualPlanAsync(
        Guid bookingId,
        Guid? triggeredByUserId,
        CancellationToken ct = default)
    {
        var booking = await _db.Bookings.FindAsync([bookingId], ct);

        if (booking is null || booking.SnapshotPackageCode != "ANNUAL-PLAN" ||
            booking.DeliveryStatus != DeliveryStatus.Delivered)
        {
            _logger.LogWarning(
                "RefreshAnnualPlan: booking {BookingId} is not a delivered ANNUAL-PLAN booking.",
                bookingId);
            return EmptyResult();
        }

        // Load the latest assessment for this family so account/device gap tasks
        // remain assessment-aware even outside the initial fulfillment.
        var latestAssessment = await _db.Assessments
            .Where(a => a.FamilyId == booking.FamilyId)
            .OrderByDescending(a => a.CreatedAt)
            .FirstOrDefaultAsync(ct);

        var ctx    = await BuildContextAsync(booking, latestAssessment, ct);
        var genCtx = MakeGenCtx(booking.FamilyId, triggeredByUserId, bookingId);
        var allSpecs = AnnualSafetyPlanTaskRules.SelectSpecs(ctx, bookingId);

        // ── Split specs by phase ───────────────────────────────────────────────
        //
        // Phase.Recurring tasks are quarterly / annual tasks that MUST be superseded
        // each cycle so DueAt is reset to now + 90 / 365 days.  The family starts the
        // new cycle with fresh Pending tasks even if they completed the old ones.
        //
        // Phase != Recurring (Ongoing and gap tasks) are refreshed in-place:
        // content changes are applied, new entity-specific tasks are created, and
        // identical tasks are skipped without touching the family's progress.
        //
        // Example (quarterly cycle):
        //   Old Q1 "Review all account passwords" → DueAt = Jan 1. Family completed it.
        //   RegenerateAsync fires → old task Superseded (cleared record), new task inserted
        //   → DueAt = Apr 1 (+90 days). The completed Q1 task is preserved in audit history
        //   via SupersededByTaskId; the family immediately sees a fresh Q2 task.

        var recurringSpecs = allSpecs.Where(s => s.Phase == TaskPhase.Recurring).ToList();
        var otherSpecs     = allSpecs.Where(s => s.Phase != TaskPhase.Recurring).ToList();

        var recurResult = recurringSpecs.Count > 0
            ? await _generator.RegenerateAsync(genCtx, recurringSpecs, ct)
            : EmptyResult();

        var otherResult = otherSpecs.Count > 0
            ? await _generator.GenerateAsync(genCtx, otherSpecs, ct)
            : EmptyResult();

        var combined = Merge(recurResult, otherResult);

        // Dismiss booking-position orphans (e.g. a book-level fallback task that no
        // longer applies because the family now has accounts + devices and entity-specific
        // tasks took over).
        var prefix       = BookingKeyPrefix(GenerationKeyStrategy.ProductSlugAnnualPlan, bookingId);
        var expectedKeys = allSpecs.Select(s => s.GenerationKey).ToHashSet(StringComparer.Ordinal);
        await DismissOrphanBookingKeysAsync(
            booking.FamilyId, prefix, expectedKeys, triggeredByUserId, ct);

        await _db.SaveChangesAsync(ct);

        _logger.LogInformation(
            "RefreshAnnualPlan [{BookingId}]: " +
            "C={Created} R={Refreshed} S={Skipped} Sup={Superseded}",
            bookingId,
            combined.CreatedCount, combined.RefreshedCount,
            combined.SkippedCount, combined.SupersededCount);

        return combined;
    }

    // ── ArchiveObsoleteTasksAsync ─────────────────────────────────────────────

    /// <inheritdoc />
    public async Task<int> ArchiveObsoleteTasksAsync(Guid familyId, CancellationToken ct = default)
    {
        // Load all active generated tasks that target a specific entity.
        // Family-level tasks (TargetId = null) are not checked here — their conditions
        // are managed by the assessment / booking regeneration flows.
        var tasks = await _db.SafetyTasks
            .Where(t =>
                t.FamilyId == familyId &&
                t.IsGenerated &&
                t.SupersededByTaskId == null &&
                t.TargetId != null)
            .ToListAsync(ct);

        if (tasks.Count == 0)
            return 0;

        // Collect active (non-archived) account, device, and family-person IDs in targeted queries.
        var activeAccountIds = await _db.Accounts
            .Where(a => a.FamilyId == familyId && a.ArchivedAt == null)
            .Select(a => a.Id)
            .ToHashSetAsync(ct);

        var activeDeviceIds = await _db.Devices
            .Where(d => d.FamilyId == familyId && d.ArchivedAt == null)
            .Select(d => d.Id)
            .ToHashSetAsync(ct);

        var activePersonIds = await _db.FamilyPersons
            .Where(p => p.FamilyId == familyId && p.ArchivedAt == null)
            .Select(p => p.Id)
            .ToHashSetAsync(ct);

        int dismissed = 0;

        foreach (var task in tasks)
        {
            if (task.Status is TaskStatus.Dismissed or TaskStatus.Superseded or TaskStatus.Completed)
                continue; // Already in a terminal state — skip.

            if (task.TargetType == TaskTargetType.Account &&
                !activeAccountIds.Contains(task.TargetId!.Value))
            {
                // Example: "Enable 2FA on john@gmail.com" — account was archived.
                DismissTask(
                    task,
                    $"Account archived — task no longer applicable (account {task.TargetId:D}).",
                    triggeredByUserId: null);
                dismissed++;
            }
            else if (task.TargetType == TaskTargetType.Device &&
                     !activeDeviceIds.Contains(task.TargetId!.Value))
            {
                // Example: "Enable screen lock on Pixel 7a" — device was archived.
                DismissTask(
                    task,
                    $"Device archived — task no longer applicable (device {task.TargetId:D}).",
                    triggeredByUserId: null);
                dismissed++;
            }
            else if (task.TargetType == TaskTargetType.FamilyMember &&
                     !activePersonIds.Contains(task.TargetId!.Value))
            {
                // Example: "Set up child online safety for Jamie" — member was archived.
                DismissTask(
                    task,
                    $"Family member archived — task no longer applicable (member {task.TargetId:D}).",
                    triggeredByUserId: null);
                dismissed++;
            }
        }

        if (dismissed > 0)
            await _db.SaveChangesAsync(ct);

        _logger.LogInformation(
            "ArchiveObsoleteTasks family {FamilyId}: dismissed {Count} orphaned entity tasks.",
            familyId, dismissed);

        return dismissed;
    }

    // ── Context builder ───────────────────────────────────────────────────────

    /// <summary>
    /// Builds a <see cref="FulfillmentContext"/> suitable for lifecycle re-generation.
    ///
    /// The <c>ExistingChecklistSourceIds</c> field is left empty because the lifecycle
    /// service does not manage checklists — it only manages tasks.
    /// </summary>
    private async Task<FulfillmentContext> BuildContextAsync(
        Booking booking,
        Assessment? latestAssessment,
        CancellationToken ct)
    {
        var members = await _db.FamilyPersons
            .Where(p => p.FamilyId == booking.FamilyId && p.ArchivedAt == null)
            .OrderByDescending(p => p.IsPrimaryContact)
            .ThenBy(p => p.DisplayName)
            .ToListAsync(ct);

        // Reload the linked incident so IncidentRecoveryPackTaskRules has fresh severity data.
        var incident = booking.SourceIncidentId.HasValue
            ? await _db.Incidents.FindAsync([booking.SourceIncidentId.Value], ct)
            : null;

        var accounts = await _db.Accounts
            .Where(a => a.FamilyId == booking.FamilyId && a.ArchivedAt == null)
            .ToListAsync(ct);

        var devices = await _db.Devices
            .Where(d => d.FamilyId == booking.FamilyId && d.ArchivedAt == null)
            .ToListAsync(ct);

        return new FulfillmentContext(
            Booking: booking,
            LatestAssessment: latestAssessment,
            FamilyPersons: members,
            LinkedIncident: incident,
            ExistingChecklistSourceIds: [],
            Accounts: accounts,
            Devices: devices);
    }

    // ── Gen-context factory ───────────────────────────────────────────────────

    private static TaskGenerationContext MakeGenCtx(
        Guid familyId,
        Guid? triggeredByUserId,
        Guid? bookingId = null,
        Guid? incidentId = null) => new()
    {
        FamilyId          = familyId,
        TriggeredByUserId = triggeredByUserId,
        BookingId         = bookingId,
        IncidentId        = incidentId,
    };

    // ── Orphan dismissal ──────────────────────────────────────────────────────

    /// <summary>
    /// Dismisses active tasks whose <c>GenerationKey</c> starts with the given
    /// booking-position prefix but is absent from the expected spec key set.
    ///
    /// Only booking-position keys (<c>task:booking:{slug}:{bookingId}:N</c>) are
    /// considered.  Entity-keyed tasks (<c>task:account:*</c>, <c>task:device:*</c>)
    /// may be shared across products and are cleaned up by
    /// <see cref="ArchiveObsoleteTasksAsync"/> instead.
    ///
    /// The method stages changes; <c>SaveChangesAsync</c> is called by the parent method.
    /// </summary>
    private async Task DismissOrphanBookingKeysAsync(
        Guid familyId,
        string bookingKeyPrefix,
        HashSet<string> expectedKeys,
        Guid? triggeredByUserId,
        CancellationToken ct)
    {
        var orphans = await _db.SafetyTasks
            .Where(t =>
                t.FamilyId == familyId &&
                t.SupersededByTaskId == null &&
                t.GenerationKey != null &&
                EF.Functions.Like(t.GenerationKey!, bookingKeyPrefix + "%"))
            .ToListAsync(ct);

        foreach (var task in orphans)
        {
            if (task.GenerationKey is not null && expectedKeys.Contains(task.GenerationKey))
                continue; // Still expected — leave it alone.

            DismissTask(
                task,
                "Dismissed by system: condition no longer applies after re-evaluation.",
                triggeredByUserId);
        }
    }

    // ── DismissTask helper ────────────────────────────────────────────────────

    /// <summary>
    /// Transitions <paramref name="task"/> to <see cref="TaskStatus.Dismissed"/> and
    /// appends an audit event.  Idempotent: does nothing if the task is already in a
    /// terminal state (Completed, Dismissed, Superseded).
    ///
    /// <b>Does not call SaveChangesAsync</b> — changes are staged for the caller to flush.
    /// </summary>
    private void DismissTask(SafetyTask task, string reason, Guid? triggeredByUserId)
    {
        if (task.Status is TaskStatus.Completed or TaskStatus.Dismissed or TaskStatus.Superseded)
            return;

        var oldStatus   = task.Status;
        task.Status     = TaskStatus.Dismissed;
        task.SkippedAt  = DateTimeOffset.UtcNow;
        task.UpdatedAt  = DateTimeOffset.UtcNow;

        _db.TaskEvents.Add(new TaskEvent
        {
            TaskId      = task.Id,
            EventType   = TaskEventType.StatusChanged,
            OldStatus   = oldStatus,
            NewStatus   = TaskStatus.Dismissed,
            Notes       = reason,
            CreatedById = triggeredByUserId,
        });
    }

    // ── Result helpers ────────────────────────────────────────────────────────

    private static TaskGenerationResult EmptyResult() =>
        new() { Outcomes = [] };

    private static TaskGenerationResult Merge(TaskGenerationResult a, TaskGenerationResult b) =>
        new()
        {
            CreatedCount    = a.CreatedCount    + b.CreatedCount,
            RefreshedCount  = a.RefreshedCount  + b.RefreshedCount,
            SkippedCount    = a.SkippedCount    + b.SkippedCount,
            SupersededCount = a.SupersededCount + b.SupersededCount,
            Outcomes        = [..a.Outcomes, ..b.Outcomes],
        };

    /// <summary>
    /// Returns the prefix used to filter booking-position generation keys.
    /// Pattern: <c>task:booking:{slug}:{bookingId}:</c>
    /// Example: <c>task:booking:family_safety_plan:3fa85f6...:1</c> matches the prefix
    ///           <c>task:booking:family_safety_plan:3fa85f6...:</c>
    /// </summary>
    private static string BookingKeyPrefix(string productSlug, Guid bookingId) =>
        $"task:booking:{productSlug.ToLowerInvariant()}:{bookingId:N}:";
}
