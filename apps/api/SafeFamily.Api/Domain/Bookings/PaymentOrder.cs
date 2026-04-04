using SafeFamily.Api.Domain.Common;

namespace SafeFamily.Api.Domain.Bookings;

/// <summary>
/// Represents a single payment transaction initiated for a booking.
/// A booking may accumulate multiple orders when earlier attempts fail and the
/// family retries. The booking's <see cref="Booking.PaymentStatus"/> always
/// mirrors the status of the most recently created order.
///
/// State machine (PaymentStatus):
///   Unpaid  → Pending          (payment session created with the gateway)
///   Pending → Paid             (gateway confirms successful capture)
///   Pending → Failed           (gateway rejects / bank declines)
///   Pending → Expired          (TTL elapsed with no gateway callback)
///   Paid    → Refunded         (full refund issued)
///   Paid    → PartiallyRefunded (partial refund issued)
/// </summary>
public class PaymentOrder : BaseEntity
{
    public Guid BookingId { get; set; }

    /// <summary>Amount to be charged (snapshot of SnapshotPrice at order creation).</summary>
    public decimal Amount { get; set; }

    /// <summary>ISO-4217 currency code.</summary>
    public string Currency { get; set; } = "USD";

    public PaymentStatus Status { get; set; } = PaymentStatus.Unpaid;

    // ── Gateway integration ───────────────────────────────────────────────────

    /// <summary>Payment provider identifier: "stripe", "vnpay", "momo", "manual", etc.</summary>
    public string? GatewayProvider { get; set; }

    /// <summary>Order / checkout-session ID returned by the payment gateway.</summary>
    public string? GatewayOrderId { get; set; }

    /// <summary>Final transaction / charge ID returned after successful capture.</summary>
    public string? GatewayTransactionId { get; set; }

    /// <summary>Payment method / flow used for this order. Set when the gateway session is opened.</summary>
    public PaymentType PaymentType { get; set; } = PaymentType.Redirect;

    /// <summary>
    /// Checkout / redirect URL returned by the gateway (payOS checkoutUrl, ZaloPay order_url, etc.).
    /// Stored so the frontend can retrieve them later without re-initiating.
    /// </summary>
    public string? PaymentUrl { get; set; }

    /// <summary>
    /// QR code image URL or data URI returned by the gateway (MoMo qrCodeUrl, ZaloPay QR, etc.).
    /// Stored alongside PaymentUrl for in-app QR display.
    /// </summary>
    public string? QrCodeUrl { get; set; }

    /// <summary>
    /// Human-readable failure reason from the gateway, populated on Failed or Expired transitions.
    /// Stored for customer support and analytics; never exposed to family users.
    /// </summary>
    public string? FailureReason { get; set; }

    /// <summary>
    /// Raw JSON snapshot of the most recent gateway webhook payload.
    /// Stored for audit and dispute resolution only — not served to front-ends.
    /// </summary>
    public string? GatewayRawResponse { get; set; }

    // ── Lifecycle timestamps ──────────────────────────────────────────────────
    public DateTimeOffset? PaidAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
    public DateTimeOffset? FailedAt { get; set; }
    public DateTimeOffset? RefundedAt { get; set; }

    /// <summary>Amount actually refunded (equals Amount for full refunds).</summary>
    public decimal? RefundedAmount { get; set; }

    // ── Navigation ────────────────────────────────────────────────────────────
    public Booking Booking { get; set; } = null!;
}
