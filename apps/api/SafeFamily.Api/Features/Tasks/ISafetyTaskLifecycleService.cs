using SafeFamily.Api.Features.Tasks.Generation;

namespace SafeFamily.Api.Features.Tasks;

/// <summary>
/// Manages the full lifecycle of generated safety tasks — from initial generation
/// through content refresh, regeneration, and archival.
///
/// <para>
/// Complements <see cref="ISafetyTaskGenerationService"/> (which handles the low-level
/// create / refresh / supersede mechanics for individual specs) by orchestrating
/// higher-level lifecycle transitions triggered by domain events:
/// <list type="bullet">
///   <item>A new safety assessment is submitted.</item>
///   <item>An incident status changes (escalation, resolution).</item>
///   <item>The quarterly/annual refresh cycle fires for an Annual Safety Plan booking.</item>
///   <item>An account or device is archived by the family.</item>
/// </list>
/// </para>
///
/// <para>
/// All methods call <c>SaveChangesAsync</c> internally.  Callers do not need to flush
/// the unit-of-work after invoking these methods.  Each method is idempotent — safe to
/// call multiple times for the same trigger without producing duplicates.
/// </para>
/// </summary>
public interface ISafetyTaskLifecycleService
{
    /// <summary>
    /// Refreshes assessment-driven tasks for a family after a new assessment is submitted.
    ///
    /// <para>
    /// <b>Mechanism</b><br/>
    /// Rebuilds task specs for all delivered FAMILY-CORE and ANNUAL-PLAN bookings using
    /// the latest assessment scores, then delegates to
    /// <see cref="ISafetyTaskGenerationService.GenerateAsync"/> for each booking.
    /// Content-changed tasks are refreshed in-place (priority, phase, description
    /// may all change as scores shift); identical tasks are skipped; new gap tasks
    /// are created.  No task supersession occurs — existing progress is preserved.
    /// </para>
    ///
    /// <para>
    /// <b>Orphan dismissal</b><br/>
    /// Booking-position tasks that no longer match any spec (e.g. a category score
    /// crossed the 75 threshold so the task is no longer emitted) are automatically
    /// dismissed with the note <c>"Dismissed by system: score target met after
    /// assessment update"</c>.  Entity-keyed tasks (<c>task:account:*</c>,
    /// <c>task:device:*</c>) are intentionally excluded — use
    /// <see cref="ArchiveObsoleteTasksAsync"/> for those.
    /// </para>
    ///
    /// <para>
    /// <b>Example</b><br/>
    /// Family's backup score was 60 → "Set up automated backups" task existed (Medium,
    /// Next7Days).  After the new assessment the score drops to 45 and becomes the lowest
    /// category → same task content-refreshed to High priority, Immediate phase.
    /// Score later reaches 80 → task is dismissed (condition resolved).
    /// </para>
    /// </summary>
    Task<TaskGenerationResult> RegenerateForAssessmentAsync(
        Guid familyId,
        Guid assessmentId,
        Guid? triggeredByUserId,
        CancellationToken ct = default);

    /// <summary>
    /// Refreshes or archives safety tasks linked to an incident, based on the
    /// incident's current status.
    ///
    /// <para>
    /// <b>Incident active (Open / InProgress)</b><br/>
    /// Finds all delivered INCIDENT-RESP bookings where <c>SourceIncidentId</c> matches.
    /// Rebuilds <see cref="Generation.IncidentRecoveryPackTaskRules"/> specs using the
    /// current incident data and calls
    /// <see cref="ISafetyTaskGenerationService.GenerateAsync"/> — refreshing priority or
    /// guidance if the incident's severity or type has been updated.
    /// Completed tasks are not disturbed.
    /// </para>
    ///
    /// <para>
    /// <b>Incident resolved or dismissed</b><br/>
    /// Pending and in-progress IRP tasks linked to this incident's bookings are
    /// dismissed with a system note.  Completed tasks are preserved as historical record.
    /// </para>
    ///
    /// <para>
    /// <b>Example</b><br/>
    /// Incident created as Medium PhishingAttempt → IRP booking fulfilled → 12 tasks
    /// generated with Medium/High priority mix.  Incident severity is later logged as
    /// Critical by an admin → this method fires → tasks are content-refreshed with
    /// critical priority and updated guidance.
    /// Incident later resolved → all remaining Pending / InProgress IRP tasks are
    /// dismissed automatically.
    /// </para>
    /// </summary>
    Task<TaskGenerationResult> RegenerateForIncidentAsync(
        Guid incidentId,
        Guid? triggeredByUserId,
        CancellationToken ct = default);

    /// <summary>
    /// Advances the recurring-task cycle for an Annual Safety Plan booking.
    ///
    /// <para>
    /// <b>Recurring tasks (Phase = Recurring)</b><br/>
    /// Uses <see cref="ISafetyTaskGenerationService.RegenerateAsync"/> to supersede the
    /// previous cycle's matching tasks and insert replacements with a fresh
    /// <c>DueAt</c>:
    /// <list type="bullet">
    ///   <item><c>now + 90 days</c> for quarterly tasks.</item>
    ///   <item><c>now + 365 days</c> for annual review tasks.</item>
    /// </list>
    /// Both completed and pending recurring tasks from the previous cycle are superseded
    /// so the new cycle starts cleanly.
    /// </para>
    ///
    /// <para>
    /// <b>Ongoing and gap tasks (Phase ≠ Recurring)</b><br/>
    /// Uses <see cref="ISafetyTaskGenerationService.GenerateAsync"/> — content is refreshed
    /// if it has changed (e.g. a new account was added → new gap task is created), otherwise
    /// skipped.  These tasks are not cycled on a schedule.
    /// </para>
    ///
    /// <para>
    /// <b>Typical caller</b><br/>
    /// <c>AnnualPlanRefreshService</c> runs nightly and calls this method for every
    /// delivered Annual Plan booking that has at least one overdue recurring task
    /// (<c>DueAt &lt; now</c>, status Pending or InProgress).
    /// </para>
    /// </summary>
    Task<TaskGenerationResult> RefreshAnnualPlanAsync(
        Guid bookingId,
        Guid? triggeredByUserId,
        CancellationToken ct = default);

    /// <summary>
    /// Dismisses generated tasks targeting entities (accounts, devices) that are no
    /// longer active for the family.
    ///
    /// <para>
    /// Loads all active (non-superseded) generated tasks for the family that carry a
    /// <c>TargetId</c>.  Cross-references them against the current set of active
    /// (non-archived) accounts and devices:
    /// <list type="bullet">
    ///   <item>If <c>TargetType = Account</c> and the account is archived → task Dismissed.</item>
    ///   <item>If <c>TargetType = Device</c> and the device is archived → task Dismissed.</item>
    /// </list>
    /// Tasks with <c>TargetType = Family</c> (i.e. no specific entity target) are not touched.
    /// Tasks already in a terminal state (Completed, Dismissed, Superseded) are skipped.
    /// </para>
    ///
    /// <para>
    /// <b>Example</b><br/>
    /// Family archives their old Pixel 7a.  The "Enable screen lock on Pixel 7a" task
    /// (TargetType = Device, TargetId = device.Id) is automatically dismissed with the
    /// system note <c>"Device archived — task no longer applicable"</c>.
    /// </para>
    ///
    /// Returns the total number of tasks dismissed. Changes are persisted internally.
    /// </summary>
    Task<int> ArchiveObsoleteTasksAsync(Guid familyId, CancellationToken ct = default);
}
