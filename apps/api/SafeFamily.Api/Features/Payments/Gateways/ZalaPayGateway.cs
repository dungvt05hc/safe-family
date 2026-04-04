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
/// ZaloPay payment gateway adapter (https://zalopay.vn).
///
/// API reference: https://docs.zalopay.vn/v2/
///
/// Flow:
///   1. POST /v2/create → returns order_url and zp_trans_token.
///   2. User opens the ZaloPay app via deep-link (order_url) or scans a QR.
///   3. ZaloPay POSTs an IPN to the callback URL in the order's embed_data.
///   4. <see cref="VerifySignature"/> validates the IPN by recomputing HMAC-SHA256 over the
///      data field using key2.
///   5. <see cref="ParseWebhookEvent"/> maps the callback to <see cref="WebhookPaymentEvent"/>.
///
/// To activate:
///   Set PaymentSettings:DefaultProvider = "zalopay"
///   and fill in PaymentSettings:ZalaPay:AppId, Key1, Key2, and RedirectUrl
///   in your environment / secrets.
/// </summary>
public sealed class ZalaPayGateway : IPaymentGateway
{
    private readonly IHttpClientFactory _httpFactory;
    private readonly ZalaPaySettings _cfg;
    private readonly ILogger<ZalaPayGateway> _logger;

    public ZalaPayGateway(
        IHttpClientFactory httpFactory,
        IOptions<PaymentSettings> settings,
        ILogger<ZalaPayGateway> logger)
    {
        _httpFactory = httpFactory;
        _cfg    = settings.Value.ZalaPay;
        _logger = logger;
    }

    public string Provider => "zalopay";

    // ── Initiate ──────────────────────────────────────────────────────────────

    /// <inheritdoc />
    public async Task<GatewayInitiateResult> InitiateAsync(
        PaymentOrder order, Booking booking, CancellationToken ct = default)
    {
        // ZaloPay requires app_trans_id in format yyMMdd_uniqueId (max 40 chars).
        var datePart   = DateTime.UtcNow.ToString("yyMMdd");
        var transId    = $"{datePart}_{order.Id:N[..16]}";
        var appTime    = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var amount     = (long)order.Amount;
        var appUser    = booking.FamilyId.ToString("N")[..16]; // stable per-family identity
        var description = $"SafeFamily Booking {booking.Id.ToString()[..8]}";

        var embedData = JsonSerializer.Serialize(new
        {
            redirecturl = _cfg.RedirectUrl,
        });

        var items = JsonSerializer.Serialize(Array.Empty<object>()); // no itemised products

        // MAC = HMAC-SHA256("{app_id}|{app_trans_id}|{app_user}|{amount}|{app_time}|{embed_data}|{item}", key1)
        var macInput = $"{_cfg.AppId}|{transId}|{appUser}|{amount}|{appTime}|{embedData}|{items}";
        var mac      = ComputeHmacSha256Hex(macInput, _cfg.Key1);

        var body = new
        {
            app_id       = int.Parse(_cfg.AppId),
            app_user     = appUser,
            app_trans_id = transId,
            app_time     = appTime,
            amount,
            embed_data   = embedData,
            item         = items,
            description,
            bank_code    = string.Empty, // empty → ZaloPay shows all available methods
            mac,
        };

        _logger.LogInformation(
            "[ZaloPay] Creating order. AppTransId={TransId} Amount={Amount}VND BookingId={BookingId}",
            transId, amount, booking.Id);

        var http     = _httpFactory.CreateClient("zalapay");
        var response = await http.PostAsJsonAsync("/v2/create", body, ct);
        var json     = await response.Content.ReadAsStringAsync(ct);

        response.EnsureSuccessStatusCode();

        using var doc      = JsonDocument.Parse(json);
        var root           = doc.RootElement;
        var returnCode     = root.GetProperty("return_code").GetInt32();

        if (returnCode != 1)
        {
            var returnMessage = root.TryGetProperty("return_message", out var rmProp)
                ? rmProp.GetString()
                : "Unknown error";
            throw new InvalidOperationException(
                $"[ZaloPay] Order creation failed. return_code={returnCode} message={returnMessage}");
        }

        var orderUrl    = root.TryGetProperty("order_url",    out var urlProp)  ? urlProp.GetString()  : null;
        var zpTransToken = root.TryGetProperty("zp_trans_token", out var ztProp) ? ztProp.GetString()    : null;

        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(15);

        return new GatewayInitiateResult(
            GatewayOrderId: zpTransToken ?? transId,
            PaymentUrl:     orderUrl,
            QrCodeUrl:      null,  // ZaloPay QR is generated client-side from the order_url deep-link
            ExpiresAt:      expiresAt,
            PaymentType:    PaymentType.Redirect);
    }

    // ── Webhook ───────────────────────────────────────────────────────────────

    /// <inheritdoc />
    /// <remarks>
    /// ZaloPay IPN sends a form-encoded body with:
    ///   <c>data</c>  — JSON string with transaction details.
    ///   <c>mac</c>   — HMAC-SHA256 of the <c>data</c> string using key2.
    ///   <c>type</c>  — event type integer (1 = payment success, 2 = refund).
    ///
    /// Verification: recompute HMAC-SHA256(data, key2) and compare with mac.
    /// </remarks>
    public bool VerifySignature(IHeaderDictionary headers, string rawBody)
    {
        try
        {
            // ZaloPay IPN is form-encoded; parse manually from raw body.
            var form = ParseFormBody(rawBody);

            if (!form.TryGetValue("data", out var data) || !form.TryGetValue("mac", out var provided))
            {
                _logger.LogWarning("[ZaloPay] IPN missing 'data' or 'mac' fields.");
                return false;
            }

            var computed = ComputeHmacSha256Hex(data, _cfg.Key2);

            return CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(provided),
                Encoding.UTF8.GetBytes(computed));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[ZaloPay] Exception during IPN signature verification.");
            return false;
        }
    }

    /// <inheritdoc />
    /// <remarks>
    /// ZaloPay IPN body (form-encoded):
    ///   data = {"app_id":..., "app_trans_id":"...", "zp_trans_id":"...", "amount":...,
    ///            "server_time":..., "channel":..., "merchant_user_id":"...", "user_fee_amount":...,
    ///            "discount_amount":...}
    ///   mac  = HMAC-SHA256(data, key2)
    ///   type = 1
    /// </remarks>
    public WebhookPaymentEvent ParseWebhookEvent(string rawBody)
    {
        var form = ParseFormBody(rawBody);

        if (!form.TryGetValue("data", out var dataJson))
            throw new InvalidOperationException("[ZaloPay] IPN body missing 'data' field.");

        using var doc     = JsonDocument.Parse(dataJson);
        var root          = doc.RootElement;

        var appTransId    = root.TryGetProperty("app_trans_id", out var atProp) ? atProp.GetString()   : null;
        var zpTransId     = root.TryGetProperty("zp_trans_id",  out var ztProp) ? ztProp.GetInt64().ToString() : null;
        decimal? amount   = root.TryGetProperty("amount",       out var amtProp) ? amtProp.GetDecimal()       : null;

        // ZaloPay type=1 in the form body means payment success.
        var type        = form.TryGetValue("type", out var typeProp) ? typeProp : "0";
        var eventType   = type == "1" ? "paid" : "failed";

        // Use zp_trans_id as the gateway reference; fall back to app_trans_id.
        var gatewayOrderId = zpTransId ?? appTransId
            ?? throw new InvalidOperationException("[ZaloPay] IPN data missing both 'zp_trans_id' and 'app_trans_id'.");

        return new WebhookPaymentEvent(gatewayOrderId, eventType, zpTransId, amount, null, rawBody);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static string ComputeHmacSha256Hex(string data, string key)
    {
        var keyBytes  = Encoding.UTF8.GetBytes(key);
        var dataBytes = Encoding.UTF8.GetBytes(data);
        var hash      = HMACSHA256.HashData(keyBytes, dataBytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static Dictionary<string, string> ParseFormBody(string body)
    {
        var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var pair in body.Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var idx = pair.IndexOf('=');
            if (idx < 0) continue;
            var key   = Uri.UnescapeDataString(pair[..idx]);
            var value = Uri.UnescapeDataString(pair[(idx + 1)..]);
            result[key] = value;
        }
        return result;
    }
}
