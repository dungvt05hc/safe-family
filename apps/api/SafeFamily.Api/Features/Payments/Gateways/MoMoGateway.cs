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
/// MoMo payment gateway adapter (https://business.momo.vn).
///
/// API reference: https://developers.momo.vn/v3docs/
///
/// Flow:
///   1. POST /v2/gateway/api/create with requestType="payWithMethod"
///      → returns payUrl (deep-link / web) and qrCodeUrl.
///   2. MoMo sends an IPN callback to the configured <see cref="MoMoSettings.IpnUrl"/>.
///   3. <see cref="VerifySignature"/> validates the momoSignature field in the webhook body
///      (HMAC-SHA256 with secretKey).
///   4. <see cref="ParseWebhookEvent"/> maps the MoMo callback to <see cref="WebhookPaymentEvent"/>.
///
/// To activate:
///   Set PaymentSettings:DefaultProvider = "momo"
///   and fill in PaymentSettings:MoMo:PartnerCode, AccessKey, SecretKey,
///   RedirectUrl, and IpnUrl in your environment / secrets.
/// </summary>
public sealed class MoMoGateway : IPaymentGateway
{
    private readonly IHttpClientFactory _httpFactory;
    private readonly MoMoSettings _cfg;
    private readonly ILogger<MoMoGateway> _logger;

    public MoMoGateway(
        IHttpClientFactory httpFactory,
        IOptions<PaymentSettings> settings,
        ILogger<MoMoGateway> logger)
    {
        _httpFactory = httpFactory;
        _cfg    = settings.Value.MoMo;
        _logger = logger;
    }

    public string Provider => "momo";

    // ── Initiate ──────────────────────────────────────────────────────────────

    /// <inheritdoc />
    public async Task<GatewayInitiateResult> InitiateAsync(
        PaymentOrder order, Booking booking, CancellationToken ct = default)
    {
        var requestId = Guid.NewGuid().ToString();
        var orderId   = $"SF-{order.Id:N}"; // unique order ID sent to MoMo
        var amount    = (long)order.Amount;
        var orderInfo = $"SafeFamily Booking {booking.Id.ToString()[..8]}";
        var extraData = string.Empty; // base64-encoded JSON metadata, empty for MVP
        var requestType = "payWithMethod"; // supports both QR and deep-link

        // MoMo signature input (alphabetical key order per docs):
        // accessKey={}&amount={}&extraData={}&ipnUrl={}&orderId={}&orderInfo={}
        // &partnerCode={}&redirectUrl={}&requestId={}&requestType={}
        var sigInput = $"accessKey={_cfg.AccessKey}" +
                       $"&amount={amount}" +
                       $"&extraData={extraData}" +
                       $"&ipnUrl={_cfg.IpnUrl}" +
                       $"&orderId={orderId}" +
                       $"&orderInfo={orderInfo}" +
                       $"&partnerCode={_cfg.PartnerCode}" +
                       $"&redirectUrl={_cfg.RedirectUrl}" +
                       $"&requestId={requestId}" +
                       $"&requestType={requestType}";

        var signature = ComputeHmacSha256Hex(sigInput, _cfg.SecretKey);

        var body = new
        {
            partnerCode = _cfg.PartnerCode,
            accessKey   = _cfg.AccessKey,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl = _cfg.RedirectUrl,
            ipnUrl      = _cfg.IpnUrl,
            lang        = "vi",
            extraData,
            requestType,
            signature,
        };

        _logger.LogInformation(
            "[MoMo] Creating payment request. OrderId={OrderId} Amount={Amount}VND BookingId={BookingId}",
            orderId, amount, booking.Id);

        var http     = _httpFactory.CreateClient("momo");
        var response = await http.PostAsJsonAsync("/v2/gateway/api/create", body, ct);
        var json     = await response.Content.ReadAsStringAsync(ct);

        response.EnsureSuccessStatusCode();

        using var doc    = JsonDocument.Parse(json);
        var root         = doc.RootElement;
        var payUrl       = root.TryGetProperty("payUrl",     out var payProp)  ? payProp.GetString()  : null;
        var qrCodeUrl    = root.TryGetProperty("qrCodeUrl",  out var qrProp)   ? qrProp.GetString()   : null;
        var deepLinkUrl  = root.TryGetProperty("deeplink",   out var dlProp)   ? dlProp.GetString()   : null;

        // Return the deeplink when available (native app), otherwise the web payUrl.
        var checkoutUrl = deepLinkUrl ?? payUrl;

        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(15);

        var paymentType = qrCodeUrl is not null && checkoutUrl is null
            ? PaymentType.QrCode
            : PaymentType.Redirect;

        return new GatewayInitiateResult(
            GatewayOrderId: orderId,
            PaymentUrl:     checkoutUrl,
            QrCodeUrl:      qrCodeUrl,
            ExpiresAt:      expiresAt,
            PaymentType:    paymentType);
    }

    // ── Webhook ───────────────────────────────────────────────────────────────

    /// <inheritdoc />
    /// <remarks>
    /// MoMo embeds <c>signature</c> in the JSON body (not a header).
    /// The signature input is the same alphabetically-sorted query string format as the request.
    /// </remarks>
    public bool VerifySignature(IHeaderDictionary headers, string rawBody)
    {
        try
        {
            using var doc = JsonDocument.Parse(rawBody);
            var root      = doc.RootElement;

            if (!root.TryGetProperty("signature", out var sigProp))
            {
                _logger.LogWarning("[MoMo] Webhook body missing 'signature' field.");
                return false;
            }

            var provided    = sigProp.GetString() ?? string.Empty;
            var accessKey   = root.TryGetProperty("accessKey",   out var akProp)   ? akProp.GetString()   ?? string.Empty : string.Empty;
            var amount      = root.TryGetProperty("amount",       out var amtProp)  ? amtProp.GetInt64()   : 0L;
            var extraData   = root.TryGetProperty("extraData",    out var exProp)   ? exProp.GetString()   ?? string.Empty : string.Empty;
            var message     = root.TryGetProperty("message",      out var msgProp)  ? msgProp.GetString()  ?? string.Empty : string.Empty;
            var orderId     = root.TryGetProperty("orderId",      out var oidProp)  ? oidProp.GetString()  ?? string.Empty : string.Empty;
            var orderInfo   = root.TryGetProperty("orderInfo",    out var oiProp)   ? oiProp.GetString()   ?? string.Empty : string.Empty;
            var orderType   = root.TryGetProperty("orderType",    out var otProp)   ? otProp.GetString()   ?? string.Empty : string.Empty;
            var partnerCode = root.TryGetProperty("partnerCode",  out var pcProp)   ? pcProp.GetString()   ?? string.Empty : string.Empty;
            var payType     = root.TryGetProperty("payType",      out var ptProp)   ? ptProp.GetString()   ?? string.Empty : string.Empty;
            var requestId   = root.TryGetProperty("requestId",    out var ridProp)  ? ridProp.GetString()  ?? string.Empty : string.Empty;
            var responseTime = root.TryGetProperty("responseTime", out var rtProp)  ? rtProp.GetInt64()    : 0L;
            var resultCode  = root.TryGetProperty("resultCode",   out var rcProp)   ? rcProp.GetInt32()    : -1;
            var transId     = root.TryGetProperty("transId",      out var tidProp)  ? tidProp.GetInt64()   : 0L;

            var sigInput = $"accessKey={accessKey}" +
                           $"&amount={amount}" +
                           $"&extraData={extraData}" +
                           $"&message={message}" +
                           $"&orderId={orderId}" +
                           $"&orderInfo={orderInfo}" +
                           $"&orderType={orderType}" +
                           $"&partnerCode={partnerCode}" +
                           $"&payType={payType}" +
                           $"&requestId={requestId}" +
                           $"&responseTime={responseTime}" +
                           $"&resultCode={resultCode}" +
                           $"&transId={transId}";

            var computed = ComputeHmacSha256Hex(sigInput, _cfg.SecretKey);

            return CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(provided),
                Encoding.UTF8.GetBytes(computed));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[MoMo] Exception during signature verification.");
            return false;
        }
    }

    /// <inheritdoc />
    /// <remarks>
    /// Expected MoMo IPN body fields used for normalisation:
    /// <list type="bullet">
    ///   <item><c>orderId</c> — our merchant order ID (GatewayOrderId).</item>
    ///   <item><c>resultCode</c> — 0 = success, anything else = failure.</item>
    ///   <item><c>transId</c> — MoMo's internal transaction ID.</item>
    ///   <item><c>amount</c> — amount confirmed by MoMo.</item>
    ///   <item><c>message</c> — human-readable failure reason on non-zero resultCode.</item>
    /// </list>
    /// </remarks>
    public WebhookPaymentEvent ParseWebhookEvent(string rawBody)
    {
        using var doc  = JsonDocument.Parse(rawBody);
        var root       = doc.RootElement;

        var orderId     = root.GetProperty("orderId").GetString()
                          ?? throw new InvalidOperationException("[MoMo] Webhook body missing 'orderId'.");
        var resultCode  = root.GetProperty("resultCode").GetInt32();
        var transId     = root.TryGetProperty("transId", out var tidProp) ? tidProp.GetInt64().ToString() : null;
        decimal? amount = root.TryGetProperty("amount",  out var amtProp) ? amtProp.GetDecimal()          : null;
        var message     = root.TryGetProperty("message", out var msgProp) ? msgProp.GetString()           : null;

        var eventType    = resultCode == 0 ? "paid" : "failed";
        var failureReason = resultCode != 0 ? message : null;

        return new WebhookPaymentEvent(orderId, eventType, transId, amount, failureReason, rawBody);
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
