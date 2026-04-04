using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Npgsql;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Features.Payments.Dtos;

namespace SafeFamily.Api.Features.Payments;

/// <summary>
/// Processes payment gateway webhook callbacks.
///
/// Idempotency strategy (atomic, race-condition safe):
///   A <see cref="WebhookLog"/> row is inserted as part of every
///   <see cref="DbContext.SaveChangesAsync"/> call. A unique DB index on
///   (Provider, GatewayOrderId, EventType) means a second concurrent delivery
///   of the same event raises PostgresException 23505 (unique_violation) which
///   rolls back the entire transaction — including the business state change —
///   and is translated to a safe 200 acknowledgement.
///
/// Supported event types (normalised):
///   "paid" / "success"     → PaymentOrder Paid, Booking status advanced to Paid
///   "failed" / "cancelled" → PaymentOrder Failed, Booking PaymentStatus set to Failed
/// </summary>
public sealed class PaymentWebhookService : IPaymentWebhookService
{
    private readonly AppDbContext _db;
    private readonly IEnumerable<IPaymentGateway> _gateways;
    private readonly ILogger<PaymentWebhookService> _logger;

    public PaymentWebhookService(
        AppDbContext db,
        IEnumerable<IPaymentGateway> gateways,
        ILogger<PaymentWebhookService> logger)
    {
        _db       = db;
        _gateways = gateways;
        _logger   = logger;
    }

    public async Task<bool> HandleAsync(
        string provider,
        IHeaderDictionary headers,
        string rawBody,
        CancellationToken ct = default)
    {
        // ── 1. Resolve gateway ────────────────────────────────────────────────
        var gateway = _gateways.FirstOrDefault(g =>
            string.Equals(g.Provider, provider, StringComparison.OrdinalIgnoreCase));

        if (gateway is null)
        {
            _logger.LogWarning("Webhook received for unknown provider '{Provider}'.", provider);
            return false;
        }

        // ── 2. Verify signature ───────────────────────────────────────────────
        // IMPORTANT: VerifySignature MUST use constant-time HMAC comparison for production providers.
        if (!gateway.VerifySignature(headers, rawBody))
        {
            _logger.LogWarning(
                "Webhook signature verification failed for provider '{Provider}'.", provider);
            return false;
        }

        // ── 3. Parse payload ──────────────────────────────────────────────────
        WebhookPaymentEvent evt;
        try
        {
            evt = gateway.ParseWebhookEvent(rawBody);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to parse webhook payload from provider '{Provider}'. Body={Body}",
                provider, rawBody.Length > 500 ? rawBody[..500] : rawBody);
            return false;
        }

        var normalizedEventType = evt.EventType.ToLowerInvariant();

        // ── 4. Create WebhookLog (idempotency entry + audit record) ───────────
        // This is tracked in the EF context but NOT yet saved to the DB.
        // It is committed atomically alongside any business-state changes in
        // step 7. The unique index fires here if a concurrent duplicate arrives,
        // rolling back the entire transaction before any business mutation lands.
        var webhookLog = new WebhookLog
        {
            Provider             = provider.ToLowerInvariant(),
            GatewayOrderId       = evt.GatewayOrderId,
            EventType            = normalizedEventType,
            GatewayTransactionId = evt.TransactionId,
            RawBody              = rawBody,
            Processed            = false, // updated to true only when a business state change is applied
        };
        _db.WebhookLogs.Add(webhookLog);

        // ── 5. Load PaymentOrder ──────────────────────────────────────────────
        var order = await _db.PaymentOrders
            .Include(o => o.Booking)
            .FirstOrDefaultAsync(o => o.GatewayOrderId == evt.GatewayOrderId, ct);

        if (order is null)
        {
            // Unknown order — could be a gateway test ping or misconfiguration.
            // We still persist the WebhookLog for audit; return 200 so the gateway stops retrying.
            webhookLog.ProcessingNote = "UnknownGatewayOrderId";
            _logger.LogWarning(
                "Webhook references unknown GatewayOrderId '{GatewayOrderId}'. Provider={Provider}.",
                evt.GatewayOrderId, provider);
            return await CommitWebhookLogAsync(webhookLog, provider, evt.GatewayOrderId, normalizedEventType, ct);
        }

        // ── 6. Determine business action ──────────────────────────────────────
        switch (normalizedEventType)
        {
            case "paid":
            case "success":
                if (order.Status is PaymentStatus.Paid
                                 or PaymentStatus.Refunded
                                 or PaymentStatus.PartiallyRefunded)
                {
                    // Defense-in-depth: order already in a positive terminal state.
                    // The unique index would normally catch this first under concurrent load.
                    webhookLog.ProcessingNote = $"SkippedAlreadyTerminal:{order.Status}";
                    _logger.LogInformation(
                        "Webhook for order {OrderId} skipped — already {Status}.",
                        order.Id, order.Status);
                }
                else
                {
                    ApplyPaid(order, evt, rawBody);
                    webhookLog.Processed = true;
                }
                break;

            case "failed":
            case "cancelled":
                if (order.Status is PaymentStatus.Failed or PaymentStatus.Expired)
                {
                    webhookLog.ProcessingNote = $"SkippedAlreadyTerminal:{order.Status}";
                    _logger.LogInformation(
                        "Failure webhook for order {OrderId} skipped — already {Status}.",
                        order.Id, order.Status);
                }
                else
                {
                    ApplyFailed(order, evt, rawBody);
                    webhookLog.Processed = true;
                }
                break;

            default:
                webhookLog.ProcessingNote = $"UnhandledEventType:{evt.EventType}";
                _logger.LogWarning(
                    "Unhandled webhook event type '{EventType}' for order {OrderId}. Acknowledged without state change.",
                    evt.EventType, order.Id);
                break;
        }

        // ── 7. Atomic commit ──────────────────────────────────────────────────
        // Single SaveChanges wraps: WebhookLog INSERT + PaymentOrder UPDATE +
        // Booking UPDATE + BookingEvent INSERT(s). If the unique index fires
        // (concurrent duplicate delivery), the entire transaction is rolled back.
        var saved = await CommitWebhookLogAsync(webhookLog, provider, evt.GatewayOrderId, normalizedEventType, ct);
        if (saved && webhookLog.Processed)
        {
            _logger.LogInformation(
                "Webhook processed. Provider={Provider} Event={Event} OrderId={OrderId} NewStatus={Status}.",
                provider, evt.EventType, order.Id, order.Status);
        }
        return saved;
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /// <summary>
    /// Calls <see cref="DbContext.SaveChangesAsync"/> and catches the PostgreSQL
    /// unique-constraint violation (23505) that indicates a concurrent duplicate
    /// webhook delivery, returning <c>true</c> in both success and duplicate cases
    /// so the gateway receives a 200 and stops retrying.
    /// </summary>
    private async Task<bool> CommitWebhookLogAsync(
        WebhookLog log,
        string provider,
        string gatewayOrderId,
        string eventType,
        CancellationToken ct)
    {
        try
        {
            await _db.SaveChangesAsync(ct);
            return true;
        }
        catch (DbUpdateException ex)
            when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            _logger.LogInformation(
                "Duplicate webhook (concurrent delivery or replay). " +
                "Provider={Provider} GatewayOrderId={OrderId} EventType={EventType}.",
                provider, gatewayOrderId, eventType);
            // Detach the conflicting entry so the context is not poisoned for any subsequent use.
            _db.Entry(log).State = EntityState.Detached;
            return true;
        }
    }

    // ── Event handlers ────────────────────────────────────────────────────────

    private void ApplyPaid(PaymentOrder order, WebhookPaymentEvent evt, string rawBody)
    {
        var booking           = order.Booking;
        var prevBookingStatus = booking.Status;

        order.Status               = PaymentStatus.Paid;
        order.PaidAt               = DateTimeOffset.UtcNow;
        order.GatewayTransactionId = evt.TransactionId;
        order.GatewayRawResponse   = rawBody; // capture payment proof

        booking.PaymentStatus = PaymentStatus.Paid;
        booking.Status        = BookingStatus.Paid;

        _db.BookingEvents.Add(new BookingEvent
        {
            BookingId   = booking.Id,
            EventType   = BookingEventTypes.PaymentReceived,
            FromValue   = PaymentStatus.Pending.ToString(),
            ToValue     = PaymentStatus.Paid.ToString(),
            Description = $"Payment confirmed by {order.GatewayProvider}. " +
                          $"Transaction: {evt.TransactionId}. Amount: {evt.Amount} {order.Currency}.",
        });

        _db.BookingEvents.Add(new BookingEvent
        {
            BookingId   = booking.Id,
            EventType   = BookingEventTypes.Paid,
            FromValue   = prevBookingStatus.ToString(),
            ToValue     = BookingStatus.Paid.ToString(),
            Description = "Booking advanced to Paid after gateway payment confirmation.",
        });
    }

    private void ApplyFailed(PaymentOrder order, WebhookPaymentEvent evt, string rawBody)
    {
        var booking = order.Booking;

        order.Status         = PaymentStatus.Failed;
        order.FailedAt        = DateTimeOffset.UtcNow;
        order.FailureReason   = evt.FailureReason;
        // Only store raw body when not already Paid — avoids overwriting payment proof.
        if (order.GatewayRawResponse is null)
            order.GatewayRawResponse = rawBody;

        booking.PaymentStatus = PaymentStatus.Failed;
        // Booking.Status remains Submitted — the family can retry payment.

        _db.BookingEvents.Add(new BookingEvent
        {
            BookingId   = booking.Id,
            EventType   = BookingEventTypes.PaymentFailed,
            FromValue   = PaymentStatus.Pending.ToString(),
            ToValue     = PaymentStatus.Failed.ToString(),
            Description = $"Payment failed via {order.GatewayProvider}. " +
                          $"Reason: {evt.FailureReason ?? evt.EventType}.",
        });
    }
}
