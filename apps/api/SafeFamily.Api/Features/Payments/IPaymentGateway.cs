using Microsoft.AspNetCore.Http;
using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Features.Payments.Dtos;

namespace SafeFamily.Api.Features.Payments;

/// <summary>
/// Abstraction for payment gateway providers.
/// Implement one class per provider (payOS, MoMo, ZaloPay, Stripe, …)
/// and register with the DI container so both <see cref="IPaymentService"/>
/// and <see cref="IPaymentWebhookService"/> can resolve the correct gateway
/// by <see cref="Provider"/> name.
///
/// Implementation guide for Vietnam gateways:
///   • payOS  — POST https://api-merchant.payos.vn/v2/payment-requests
///              Returns checkoutUrl + qrCode. Checksum: HMAC-SHA256 with checksumKey.
///   • MoMo   — POST https://payment.momo.vn/v2/gateway/api/create
///              Returns payUrl + qrCodeUrl. Signature: HMAC-SHA256 with secretKey.
///   • ZaloPay — POST https://sb-openapi.zalopay.vn/v2/create
///              Returns order_url + zp_trans_token. Mac: HMAC-SHA256 with key2.
/// </summary>
public interface IPaymentGateway
{
    /// <summary>
    /// Lowercase provider identifier used to match routes and configuration.
    /// Examples: "mock", "payos", "momo", "zalopay".
    /// </summary>
    string Provider { get; }

    /// <summary>
    /// Creates a payment session / order with the gateway and returns the
    /// checkout URL, QR code URL, and session expiry timestamp.
    /// </summary>
    /// <param name="order">The <see cref="PaymentOrder"/> being paid. Its <see cref="PaymentOrder.Id"/>
    /// should be passed as the merchant's order reference for reconciliation.</param>
    /// <param name="booking">Parent booking — used to include description / metadata in the gateway request.</param>
    Task<GatewayInitiateResult> InitiateAsync(
        PaymentOrder order,
        Booking booking,
        CancellationToken ct = default);

    /// <summary>
    /// Validates the HMAC / checksum signature sent with a webhook callback.
    /// <para>
    /// IMPORTANT: This MUST be implemented correctly for each provider before
    /// going live. The mock implementation always returns <c>true</c> and is
    /// NOT safe for production.
    /// </para>
    /// </summary>
    /// <returns><c>true</c> if the webhook payload is authentic; otherwise <c>false</c>.</returns>
    bool VerifySignature(IHeaderDictionary headers, string rawBody);

    /// <summary>
    /// Parses the provider-specific webhook JSON body into the common
    /// <see cref="WebhookPaymentEvent"/> structure.
    /// </summary>
    WebhookPaymentEvent ParseWebhookEvent(string rawBody);
}
