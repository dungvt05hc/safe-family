using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Domain.Tasks;
using SafeFamily.Api.Features.Tasks;
using TaskStatus = SafeFamily.Api.Domain.Tasks.TaskStatus;

namespace SafeFamily.Api.Infrastructure.BackgroundServices;

/// <summary>
/// Nightly background job that advances the recurring-task cycle for delivered
/// Annual Safety Plan bookings.
///
/// <para>
/// <b>Trigger condition</b><br/>
/// A booking is eligible for refresh when it has at least one recurring safety task
/// (<c>Phase = Recurring</c>) whose <c>DueAt</c> has elapsed and whose status is
/// still <c>Pending</c> or <c>InProgress</c>.  This ensures the refresh only fires
/// when the family is actually overdue — not continuously.
/// </para>
///
/// <para>
/// <b>What it does</b><br/>
/// Calls <see cref="ISafetyTaskLifecycleService.RefreshAnnualPlanAsync"/> for each
/// eligible booking.  That method:
/// <list type="number">
///   <item>Supersedes the previous cycle's recurring tasks and creates replacements
///     with <c>DueAt = now + 90 days</c> (quarterly) or <c>now + 365 days</c> (annual).</item>
///   <item>Refreshes ongoing and gap tasks in-place.</item>
/// </list>
/// </para>
///
/// <para>
/// BackgroundService is singleton. Scoped services (<see cref="AppDbContext"/>,
/// <see cref="ISafetyTaskLifecycleService"/>) are resolved per cycle via
/// <see cref="IServiceScopeFactory"/>.
/// </para>
/// </summary>
public sealed class AnnualPlanRefreshService : BackgroundService
{
    // Check once per day. Individual booking eligibility is gated by DueAt,
    // so running daily is safe and incurs minimal overhead.
    private static readonly TimeSpan CheckInterval = TimeSpan.FromHours(24);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AnnualPlanRefreshService> _logger;

    public AnnualPlanRefreshService(
        IServiceScopeFactory scopeFactory,
        ILogger<AnnualPlanRefreshService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger       = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AnnualPlanRefreshService started. Check interval: {Hours}h.",
            CheckInterval.TotalHours);

        // Wait one interval before the first run so the service doesn't fire immediately
        // on startup before the database migration has fully applied.
        await Task.Delay(CheckInterval, stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RunRefreshCycleAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AnnualPlanRefreshService: unhandled error during cycle.");
            }

            await Task.Delay(CheckInterval, stoppingToken);
        }

        _logger.LogInformation("AnnualPlanRefreshService stopped.");
    }

    private async Task RunRefreshCycleAsync(CancellationToken ct)
    {
        using var scope    = _scopeFactory.CreateScope();
        var db             = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var lifecycleService = scope.ServiceProvider.GetRequiredService<ISafetyTaskLifecycleService>();
        var now            = DateTimeOffset.UtcNow;

        // Find booking IDs for delivered ANNUAL-PLAN bookings that have at least one
        // recurring task whose DueAt has elapsed and is still actionable.
        //
        // Eligibility check:
        //   Phase = Recurring  (stored as string due to HasConversion<string>())
        //   Status = Pending or InProgress
        //   DueAt < now

        var eligibleBookingIds = await db.SafetyTasks
            .Where(t =>
                t.SourceType     == TaskSourceType.AnnualPlan &&
                t.Phase          == TaskPhase.Recurring &&
                t.SupersededByTaskId == null &&
                t.DueAt          != null &&
                t.DueAt          < now &&
                (t.Status == TaskStatus.Pending || t.Status == TaskStatus.InProgress))
            .Select(t => t.SourceId) // SourceId == booking.Id.ToString("N") for AnnualPlan tasks
            .Distinct()
            .ToListAsync(ct);

        if (eligibleBookingIds.Count == 0)
            return;

        // Resolve the actual Booking IDs from the SourceId strings.
        var bookingGuids = eligibleBookingIds
            .Where(id => id is not null && Guid.TryParseExact(id, "N", out _))
            .Select(id => Guid.ParseExact(id!, "N"))
            .ToList();

        // Cross-reference against actual delivered bookings (double-check in DB).
        var deliveredIds = await db.Bookings
            .Where(b =>
                bookingGuids.Contains(b.Id) &&
                b.SnapshotPackageCode == "ANNUAL-PLAN" &&
                b.DeliveryStatus      == DeliveryStatus.Delivered)
            .Select(b => b.Id)
            .ToListAsync(ct);

        _logger.LogInformation(
            "AnnualPlanRefreshService: {Count} booking(s) eligible for cycle refresh.",
            deliveredIds.Count);

        foreach (var bookingId in deliveredIds)
        {
            try
            {
                var result = await lifecycleService.RefreshAnnualPlanAsync(
                    bookingId, triggeredByUserId: null, ct);

                _logger.LogInformation(
                    "AnnualPlanRefreshService refreshed booking {BookingId}: " +
                    "C={Created} R={Refreshed} S={Skipped} Sup={Superseded}",
                    bookingId,
                    result.CreatedCount, result.RefreshedCount,
                    result.SkippedCount, result.SupersededCount);
            }
            catch (Exception ex)
            {
                // Log but continue — one booking failure should not block others.
                _logger.LogError(ex,
                    "AnnualPlanRefreshService: failed to refresh booking {BookingId}.", bookingId);
            }
        }
    }
}
