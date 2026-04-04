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
}
