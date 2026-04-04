using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Features.Payments.Dtos;

namespace SafeFamily.Api.Features.Payments.Gateways;

/// <summary>
/// Development-only payment gateway stub.
///
/// Behaviour:
///   • <see cref="InitiateAsync"/> — returns a localhost fake checkout URL and QR URL
///     so the frontend can render them during development.
///   • <see cref="VerifySignature"/> — always returns <c>true</c> (NOT safe for production).
///   • <see cref="ParseWebhookEvent"/> — expects a simple JSON body:
///       { "gatewayOrderId": "...", "event": "paid"|"failed", "transactionId": "...", "amount": 0 }
///
/// To simulate a payment callback during development, POST to:
///   /api/webhooks/payment/mock
/// with the JSON body format above.
///
/// Replace this class with a real provider adapter before going to production.
/// See <see cref="IPaymentGateway"/> for implementation guidance on payOS / MoMo / ZaloPay.
/// </summary>
public sealed class MockPaymentGateway : IPaymentGateway
{
    private readonly PaymentSettings _settings;
    private readonly ILogger<MockPaymentGateway> _logger;

    public MockPaymentGateway(
        IOptions<PaymentSettings> settings,
        ILogger<MockPaymentGateway> logger)
    {
        _settings = settings.Value;
        _logger   = logger;
    }

    public string Provider => "mock";

    public Task<GatewayInitiateResult> InitiateAsync(
        PaymentOrder order, Booking booking, CancellationToken ct = default)
    {
        // Use the PaymentOrder.Id as the merchant reference so it can be
        // resolved back on webhook callback.
        var gatewayOrderId = $"MOCK-{order.Id:N}";
        var expiresAt      = DateTimeOffset.UtcNow.AddMinutes(_settings.PaymentExpiryMinutes);

        var paymentUrl = $"https://pay.safefamily.local/mock/checkout?orderId={gatewayOrderId}";
        var qrCodeUrl  = $"https://pay.safefamily.local/mock/qr?orderId={gatewayOrderId}";

        _logger.LogInformation(
            "[MockGateway] Payment session created. OrderId={GatewayOrderId} Amount={Amount} {Currency} ExpiresAt={ExpiresAt}",
            gatewayOrderId, order.Amount, order.Currency, expiresAt);

        return Task.FromResult(new GatewayInitiateResult(gatewayOrderId, paymentUrl, qrCodeUrl, expiresAt));
    }

    /// <inheritdoc />
    /// <remarks>
    /// TODO (production): Replace with HMAC-SHA256 verification using the provider's secret key.
    /// Example for payOS:
    ///   var signature = headers["x-payos-signature"];
    ///   var computed  = HMACSHA256.HashData(Encoding.UTF8.GetBytes(checksumKey), Encoding.UTF8.GetBytes(rawBody));
    ///   return CryptographicOperations.FixedTimeEquals(Convert.FromHexString(signature!), computed);
    /// </remarks>
    public bool VerifySignature(IHeaderDictionary headers, string rawBody)
    {
        // WARNING: This mock implementation accepts all payloads.
        // A real implementation MUST perform constant-time HMAC comparison here.
        _logger.LogWarning("[MockGateway] Signature verification skipped (development stub).");
        return true;
    }

    /// <inheritdoc />
    /// <remarks>
    /// Expected body shape for the mock provider:
    /// <code>
    /// {
    ///   "gatewayOrderId": "MOCK-{uuid}",
    ///   "event":          "paid" | "failed" | "cancelled",
    ///   "transactionId":  "TXN123",   // optional
    ///   "amount":         150000       // optional, in smallest currency unit or decimal
    /// }
    /// </code>
    /// </remarks>
    public WebhookPaymentEvent ParseWebhookEvent(string rawBody)
    {
        using var doc  = JsonDocument.Parse(rawBody);
        var root       = doc.RootElement;

        var gatewayOrderId = root.GetProperty("gatewayOrderId").GetString()
                             ?? throw new InvalidOperationException("Webhook body missing 'gatewayOrderId'.");

        var eventType     = root.GetProperty("event").GetString()
                            ?? throw new InvalidOperationException("Webhook body missing 'event'.");

        string? transactionId = root.TryGetProperty("transactionId", out var txProp)
            ? txProp.GetString() : null;

        decimal? amount = root.TryGetProperty("amount", out var amtProp)
            ? (decimal?)amtProp.GetDecimal() : null;

        return new WebhookPaymentEvent(gatewayOrderId, eventType, transactionId, amount, null, rawBody);
    }
}
