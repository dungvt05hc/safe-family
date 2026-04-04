using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Features.Payments;

namespace SafeFamily.Api.Infrastructure.BackgroundServices;

/// <summary>
/// Periodically scans for <see cref="PaymentOrder"/> records in <c>Pending</c> state
/// whose <c>ExpiresAt</c> has passed and marks them as <see cref="PaymentStatus.Expired"/>.
///
/// When all payment orders for a booking have reached a terminal state and the
/// booking's own <c>ExpiresAt</c> deadline has elapsed, the booking is also
/// transitioned to <see cref="BookingStatus.Expired"/>.
///
/// Run interval is controlled by <see cref="PaymentSettings.ExpiryCheckIntervalSeconds"/>.
///
/// BackgroundService is singleton, so a new <see cref="AppDbContext"/> scope is created
/// per cycle via <see cref="IServiceScopeFactory"/>.
/// </summary>
public sealed class PaymentExpiryService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<PaymentExpiryService> _logger;
    private readonly TimeSpan _interval;

    public PaymentExpiryService(
        IServiceScopeFactory scopeFactory,
        ILogger<PaymentExpiryService> logger,
        IOptions<PaymentSettings> settings)
    {
        _scopeFactory = scopeFactory;
        _logger       = logger;
        _interval     = TimeSpan.FromSeconds(settings.Value.ExpiryCheckIntervalSeconds);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "PaymentExpiryService started. Check interval: {Interval}s.", _interval.TotalSeconds);

        while (!stoppingToken.IsCancellationRequested)
        {
            // Wait first so the service doesn't run immediately on startup before
            // the database is fully ready.
            await Task.Delay(_interval, stoppingToken);

            try
            {
                await RunExpiryCheckAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Normal shutdown — let the loop exit.
                break;
            }
            catch (Exception ex)
            {
                // Log but continue — a transient DB error should not kill the service.
                _logger.LogError(ex, "Error during PaymentExpiryService cycle.");
            }
        }

        _logger.LogInformation("PaymentExpiryService stopped.");
    }

    private async Task RunExpiryCheckAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db          = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var now         = DateTimeOffset.UtcNow;

        // Load all Pending orders whose TTL has elapsed.
        var expiredOrders = await db.PaymentOrders
            .Include(o => o.Booking)
            .Where(o => o.Status == PaymentStatus.Pending
                     && o.ExpiresAt.HasValue
                     && o.ExpiresAt.Value <= now)
            .ToListAsync(ct);

        if (expiredOrders.Count == 0)
            return;

        _logger.LogInformation(
            "PaymentExpiryService: expiring {Count} payment order(s).", expiredOrders.Count);

        // Pre-collect the IDs being expired in this batch so the DB check below can
        // correctly exclude them.  (EF Core queries hit the DB before SaveChanges,
        // meaning orders we just marked Expired in memory still appear Pending in the DB.)
        var expiringIds = expiredOrders.Select(o => o.Id).ToHashSet();

        foreach (var order in expiredOrders)
        {
            order.Status           = PaymentStatus.Expired;
            order.FailedAt         = now;

            var booking            = order.Booking;
            booking.PaymentStatus  = PaymentStatus.Expired;

            db.BookingEvents.Add(new BookingEvent
            {
                BookingId   = booking.Id,
                EventType   = BookingEventTypes.PaymentExpired,
                FromValue   = PaymentStatus.Pending.ToString(),
                ToValue     = PaymentStatus.Expired.ToString(),
                Description = $"Payment order {order.Id} expired at {now:O}. " +
                              $"GatewayOrderId: {order.GatewayOrderId}.",
            });

            // Expire the booking itself only when:
            //   1. The booking's own ExpiresAt deadline has passed, AND
            //   2. There are no remaining active (Unpaid or Pending) orders.
            //      Exclude orders in the current expiry batch (not yet saved to DB)
            //      and account for concurrent retries that may have created a new order.
            if (booking.ExpiresAt.HasValue && booking.ExpiresAt.Value <= now)
            {
                var hasActiveOrder = await db.PaymentOrders
                    .AnyAsync(o => o.BookingId == booking.Id
                               && !expiringIds.Contains(o.Id)
                               && (o.Status == PaymentStatus.Unpaid
                                   || o.Status == PaymentStatus.Pending), ct);

                if (!hasActiveOrder)
                {
                    var previousBookingStatus = booking.Status;
                    booking.Status = BookingStatus.Expired;

                    db.BookingEvents.Add(new BookingEvent
                    {
                        BookingId   = booking.Id,
                        EventType   = BookingEventTypes.Expired,
                        FromValue   = previousBookingStatus.ToString(),
                        ToValue     = BookingStatus.Expired.ToString(),
                        Description = "Booking expired — payment window closed with no successful payment.",
                    });

                    _logger.LogInformation(
                        "Booking {BookingId} expired at {Now}.", booking.Id, now);
                }
            }
        }

        await db.SaveChangesAsync(ct);
    }
}
