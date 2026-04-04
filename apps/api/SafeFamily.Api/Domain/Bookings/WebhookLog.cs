using SafeFamily.Api.Domain.Common;

namespace SafeFamily.Api.Domain.Bookings;

/// <summary>
/// Immutable audit record of every inbound payment gateway webhook.
///
/// Also acts as the atomic idempotency gate: a unique DB index on
/// (Provider, GatewayOrderId, EventType) guarantees that exactly one
/// call to <see cref="ProcessingNote"/> succeeds even under concurrent
/// duplicate deliveries from the gateway.
///
/// Lifecycle:
///   • <see cref="Processed"/> = false — webhook was received and logged
///     but no business-state change was applied (duplicate, unknown order,
///     unhandled event type, etc.).
///   • <see cref="Processed"/> = true — the business event was successfully
///     applied to the <see cref="PaymentOrder"/> and its parent Booking.
/// </summary>
public class WebhookLog : BaseEntity
{
    /// <summary>Lowercase provider name from the webhook route: "mock", "payos", "momo", "zalopay".</summary>
    public string Provider { get; set; } = string.Empty;

    /// <summary>Order / session ID assigned by the payment gateway — used to look up our PaymentOrder.</summary>
    public string GatewayOrderId { get; set; } = string.Empty;

    /// <summary>Normalised event type: "paid", "failed", "cancelled". Lowercase.</summary>
    public string EventType { get; set; } = string.Empty;

    /// <summary>Gateway transaction/charge ID, if present in the payload.</summary>
    public string? GatewayTransactionId { get; set; }

    /// <summary>True when the business state change (PaymentOrder / Booking update) was applied.</summary>
    public bool Processed { get; set; }

    /// <summary>
    /// Human-readable reason this webhook was NOT processed.
    /// Null when <see cref="Processed"/> is true.
    /// Examples: "UnknownGatewayOrderId", "AlreadyTerminal:Paid", "UnhandledEventType:pending".
    /// </summary>
    public string? ProcessingNote { get; set; }

    /// <summary>Exact raw request body received from the gateway. Stored for debugging and potential replay.</summary>
    public string RawBody { get; set; } = string.Empty;
}
