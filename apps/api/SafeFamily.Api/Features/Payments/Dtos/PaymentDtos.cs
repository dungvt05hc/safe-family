using SafeFamily.Api.Domain.Bookings;

namespace SafeFamily.Api.Features.Payments.Dtos;

// ── Frontend-facing responses ─────────────────────────────────────────────────

/// <summary>
/// Returned to the frontend after a successful payment initiation or retry.
/// The frontend should redirect the user to <see cref="PaymentUrl"/> or render
/// the <see cref="QrCodeUrl"/> for in-app QR display.
/// </summary>
public record PaymentInitiateResponse(
    Guid   PaymentOrderId,
    Guid   BookingId,
    /// <summary>Full checkout URL for redirect-based flows (payOS, ZaloPay).</summary>
    string? PaymentUrl,
    /// <summary>QR code image or data URL for scan-to-pay flows (MoMo, ZaloPay).</summary>
    string? QrCodeUrl,
    /// <summary>UTC deadline after which this payment session expires.</summary>
    DateTimeOffset ExpiresAt,
    string GatewayProvider,
    decimal Amount,
    string Currency);

// ── Internal gateway contract ─────────────────────────────────────────────────

/// <summary>
/// Result returned by <see cref="IPaymentGateway.InitiateAsync"/>.
/// Contains gateway-specific identifiers and the deep-link / QR data
/// required to redirect or prompt the user to pay.
/// </summary>
public record GatewayInitiateResult(
    /// <summary>The order / session ID assigned by the payment gateway.</summary>
    string GatewayOrderId,
    /// <summary>Checkout URL (deep-link or web redirect). Null for QR-only flows.</summary>
    string? PaymentUrl,
    /// <summary>QR code URL or data URI. Null for redirect-only flows.</summary>
    string? QrCodeUrl,
    /// <summary>UTC timestamp when this payment session expires.</summary>
    DateTimeOffset ExpiresAt,
    /// <summary>Payment method / flow type used. Defaults to Redirect for gateways that don't specify.</summary>
    PaymentType PaymentType = PaymentType.Redirect);

/// <summary>
/// Normalized payment event extracted from a gateway webhook payload.
/// All gateway-specific JSON shapes are mapped to this structure inside
/// <see cref="IPaymentGateway.ParseWebhookEvent"/>.
/// </summary>
public record WebhookPaymentEvent(
    /// <summary>The gateway's own order ID — used to look up our <see cref="Domain.Bookings.PaymentOrder"/>.</summary>
    string GatewayOrderId,
    /// <summary>Normalized event type: "paid" | "failed" | "cancelled".</summary>
    string EventType,
    /// <summary>Gateway transaction / charge ID returned on successful capture.</summary>
    string? TransactionId,
    /// <summary>Amount confirmed by the gateway (for reconciliation).</summary>
    decimal? Amount,
    /// <summary>Human-readable failure reason from the gateway, if available.</summary>
    string? FailureReason,
    /// <summary>Original raw body — stored in <see cref="Domain.Bookings.PaymentOrder.GatewayRawResponse"/> for auditing.</summary>
    string RawBody);
