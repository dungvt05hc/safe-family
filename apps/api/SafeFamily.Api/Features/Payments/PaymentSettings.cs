namespace SafeFamily.Api.Features.Payments;

/// <summary>
/// Bound from the <c>PaymentSettings</c> section of appsettings.json.
/// </summary>
public sealed class PaymentSettings
{
    public const string SectionName = "PaymentSettings";

    /// <summary>
    /// The active payment provider used for creating new sessions.
    /// Must match the <see cref="IPaymentGateway.Provider"/> value of a registered gateway.
    /// Examples: "mock", "payos", "momo", "zalopay".
    /// </summary>
    public string DefaultProvider { get; set; } = "mock";

    /// <summary>ISO-4217 currency code sent to the gateway when not overridden by the booking.</summary>
    public string DefaultCurrency { get; set; } = "VND";

    /// <summary>
    /// How many minutes a newly created payment session remains valid.
    /// Passed to the gateway as the order TTL and also stored on the PaymentOrder.
    /// </summary>
    public int PaymentExpiryMinutes { get; set; } = 15;

    /// <summary>
    /// Interval in seconds between expiry-check cycles run by <c>PaymentExpiryService</c>.
    /// </summary>
    public int ExpiryCheckIntervalSeconds { get; set; } = 60;

    // ── Per-provider configuration ────────────────────────────────────────────

    /// <summary>payOS credentials (https://payos.vn).</summary>
    public PayOsSettings PayOs { get; set; } = new();

    /// <summary>MoMo credentials (https://business.momo.vn).</summary>
    public MoMoSettings MoMo { get; set; } = new();

    /// <summary>ZaloPay credentials (https://zalopay.vn/developer).</summary>
    public ZalaPaySettings ZalaPay { get; set; } = new();
}

// ─── payOS ───────────────────────────────────────────────────────────────────

/// <summary>
/// payOS merchant credentials.
/// Obtain from https://my.payos.vn → Developer → API Keys.
/// </summary>
public sealed class PayOsSettings
{
    /// <summary>x-client-id header value for all API requests.</summary>
    public string ClientId { get; set; } = string.Empty;

    /// <summary>x-api-key header value for all API requests.</summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// HMAC-SHA256 key used to compute and verify webhook checksums.
    /// Found under Developer → Webhook in the payOS merchant dashboard.
    /// </summary>
    public string ChecksumKey { get; set; } = string.Empty;

    /// <summary>
    /// Full URL the payer should be redirected to after a successful payment.
    /// e.g. "https://app.safefamily.vn/bookings/{bookingId}/payment/success"
    /// </summary>
    public string ReturnUrl { get; set; } = string.Empty;

    /// <summary>Full URL the payer is sent to when they click Cancel on the payOS checkout page.</summary>
    public string CancelUrl { get; set; } = string.Empty;

    public string BaseUrl { get; set; } = "https://api-merchant.payos.vn";
}

// ─── MoMo ────────────────────────────────────────────────────────────────────

/// <summary>
/// MoMo merchant credentials.
/// Obtain from https://business.momo.vn → API Settings.
/// </summary>
public sealed class MoMoSettings
{
    public string PartnerCode { get; set; } = string.Empty;
    public string AccessKey   { get; set; } = string.Empty;
    public string SecretKey   { get; set; } = string.Empty;

    /// <summary>
    /// Deep-link or web URL the MoMo app redirects the customer to after payment.
    /// Must be registered in the MoMo partner portal.
    /// </summary>
    public string RedirectUrl { get; set; } = string.Empty;

    /// <summary>
    /// IPN (Instant Payment Notification) URL — MoMo will POST payment events here.
    /// Must match the public webhook URL registered in the MoMo partner portal.
    /// e.g. "https://api.safefamily.vn/api/webhooks/payment/momo"
    /// </summary>
    public string IpnUrl { get; set; } = string.Empty;

    public string BaseUrl { get; set; } = "https://payment.momo.vn";
}

// ─── ZaloPay ─────────────────────────────────────────────────────────────────

/// <summary>
/// ZaloPay merchant credentials.
/// Obtain from https://developers.zalopay.vn → Applications.
/// </summary>
public sealed class ZalaPaySettings
{
    public string AppId { get; set; } = string.Empty;

    /// <summary>key1 — used to compute the MAC when creating orders.</summary>
    public string Key1 { get; set; } = string.Empty;

    /// <summary>key2 — used to verify IPN webhook callbacks from ZaloPay.</summary>
    public string Key2 { get; set; } = string.Empty;

    /// <summary>
    /// Callback URL ZaloPay redirects the user to after the in-app payment flow completes.
    /// </summary>
    public string RedirectUrl { get; set; } = string.Empty;

    public string BaseUrl { get; set; } = "https://openapi.zalopay.vn";
}
