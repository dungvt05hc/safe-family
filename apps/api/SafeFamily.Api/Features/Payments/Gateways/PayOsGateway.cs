using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Features.Payments.Dtos;

namespace SafeFamily.Api.Features.Payments.Gateways;

/// <summary>
/// payOS payment gateway adapter (https://payos.vn).
///
/// API reference: https://payos.vn/docs/api/
///
/// Flow:
///   1. POST /v2/payment-requests → returns a checkoutUrl and qrCode.
///   2. User pays on the payOS hosted page or scans the QR.
///   3. payOS POSTs a webhook to /api/webhooks/payment/payos.
///   4. <see cref="VerifySignature"/> validates x-payos-signature (HMAC-SHA256 with checksumKey).
///   5. <see cref="ParseWebhookEvent"/> maps the payOS body to <see cref="WebhookPaymentEvent"/>.
///
/// To activate:
///   Set PaymentSettings:DefaultProvider = "payos"
///   and fill in PaymentSettings:PayOs:ClientId, ApiKey, ChecksumKey,
///   ReturnUrl, and CancelUrl in your environment / secrets.
/// </summary>
public sealed class PayOsGateway : IPaymentGateway
{
    private readonly IHttpClientFactory _httpFactory;
    private readonly PayOsSettings _cfg;
    private readonly ILogger<PayOsGateway> _logger;

    public PayOsGateway(
        IHttpClientFactory httpFactory,
        IOptions<PaymentSettings> settings,
        ILogger<PayOsGateway> logger)
    {
        _httpFactory = httpFactory;
        _cfg    = settings.Value.PayOs;
        _logger = logger;
    }

    public string Provider => "payos";

    // ── Initiate ──────────────────────────────────────────────────────────────

    /// <inheritdoc />
    public async Task<GatewayInitiateResult> InitiateAsync(
        PaymentOrder order, Booking booking, CancellationToken ct = default)
    {
        // payOS requires an integer orderCode — use the last 10 hex chars of the PaymentOrder id
        // to produce a stable < 9007199254740991 (JS MAX_SAFE_INTEGER) order code.
        var orderCode = BitConverter.ToInt64(order.Id.ToByteArray(), 8) & 0x0000_FFFF_FFFF_FFFFL;

        var description = $"SF Booking {booking.Id:N[..8]}"; // ≤ 25 chars required by payOS
        var amountVnd   = (long)order.Amount;

        // Compute checksum: HMAC-SHA256 of canonical sorted query string.
        // payOS doc: https://payos.vn/docs/api/#section/Checksum
        var checksumInput = $"amount={amountVnd}" +
                            $"&cancelUrl={_cfg.CancelUrl}" +
                            $"&description={description}" +
                            $"&orderCode={orderCode}" +
                            $"&returnUrl={_cfg.ReturnUrl}";

        var checksum = ComputeHmacSha256Hex(checksumInput, _cfg.ChecksumKey);

        var body = new
        {
            orderCode,
            amount      = amountVnd,
            description,
            cancelUrl   = _cfg.CancelUrl,
            returnUrl   = _cfg.ReturnUrl,
            expiredAt   = DateTimeOffset.UtcNow.AddMinutes(15).ToUnixTimeSeconds(),
            signature   = checksum,
        };

        _logger.LogInformation(
            "[payOS] Creating payment request. OrderCode={OrderCode} Amount={Amount}VND BookingId={BookingId}",
            orderCode, amountVnd, booking.Id);

        var http     = _httpFactory.CreateClient("payos");
        var response = await http.PostAsJsonAsync("/v2/payment-requests", body, ct);
        var json     = await response.Content.ReadAsStringAsync(ct);

        response.EnsureSuccessStatusCode();

        using var doc   = JsonDocument.Parse(json);
        var data        = doc.RootElement.GetProperty("data");
        var checkoutUrl = data.GetProperty("checkoutUrl").GetString();
        var qrCode      = data.TryGetProperty("qrCode", out var qrProp) ? qrProp.GetString() : null;
        var gatewayId   = data.GetProperty("paymentLinkId").GetString()
                          ?? orderCode.ToString();

        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(15);

        return new GatewayInitiateResult(
            GatewayOrderId: gatewayId,
            PaymentUrl:     checkoutUrl,
            QrCodeUrl:      qrCode,
            ExpiresAt:      expiresAt,
            PaymentType:    PaymentType.Redirect);
    }

    // ── Webhook ───────────────────────────────────────────────────────────────

    /// <inheritdoc />
    /// <remarks>
    /// payOS sends <c>x-payos-signature</c> as a lowercase hex HMAC-SHA256 of the raw body
    /// using the merchant's checksumKey.
    /// </remarks>
    public bool VerifySignature(IHeaderDictionary headers, string rawBody)
    {
        if (!headers.TryGetValue("x-payos-signature", out var sigValues)
            || sigValues.Count == 0)
        {
            _logger.LogWarning("[payOS] Webhook missing x-payos-signature header.");
            return false;
        }

        var provided = sigValues[0];
        var computed = ComputeHmacSha256Hex(rawBody, _cfg.ChecksumKey);

        // Constant-time comparison prevents timing-oracle attacks.
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(provided ?? string.Empty),
            Encoding.UTF8.GetBytes(computed));
    }

    /// <inheritdoc />
    /// <remarks>
    /// Expected payOS webhook body (simplified; see full schema in payOS docs):
    /// <code>
    /// {
    ///   "code": "00",
    ///   "desc": "success",
    ///   "data": {
    ///     "orderCode":     123456789,
    ///     "paymentLinkId": "abc...",
    ///     "amount":        150000,
    ///     "status":        "PAID",   // "PAID" | "CANCELLED" | "EXPIRED"
    ///     "transactions": [
    ///       { "reference": "TXN...", "amount": 150000, ... }
    ///     ]
    ///   },
    ///   "signature": "..."
    /// }
    /// </code>
    /// </remarks>
    public WebhookPaymentEvent ParseWebhookEvent(string rawBody)
    {
        using var doc = JsonDocument.Parse(rawBody);
        var root      = doc.RootElement;
        var data      = root.GetProperty("data");

        var paymentLinkId = data.TryGetProperty("paymentLinkId", out var idProp)
            ? idProp.GetString() ?? string.Empty
            : data.GetProperty("orderCode").GetInt64().ToString();

        var status = data.GetProperty("status").GetString()?.ToUpperInvariant();

        var normalizedEvent = status switch
        {
            "PAID"      => "paid",
            "CANCELLED" => "failed",
            "EXPIRED"   => "failed",
            _           => "failed",
        };

        decimal? amount = data.TryGetProperty("amount", out var amtProp) ? amtProp.GetDecimal() : null;

        string? transactionId = null;
        if (data.TryGetProperty("transactions", out var txArrayProp)
            && txArrayProp.ValueKind == JsonValueKind.Array
            && txArrayProp.GetArrayLength() > 0)
        {
            var firstTx = txArrayProp[0];
            if (firstTx.TryGetProperty("reference", out var refProp))
                transactionId = refProp.GetString();
        }

        return new WebhookPaymentEvent(paymentLinkId, normalizedEvent, transactionId, amount, null, rawBody);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static string ComputeHmacSha256Hex(string data, string key)
    {
        var keyBytes  = Encoding.UTF8.GetBytes(key);
        var dataBytes = Encoding.UTF8.GetBytes(data);
        var hash      = HMACSHA256.HashData(keyBytes, dataBytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
