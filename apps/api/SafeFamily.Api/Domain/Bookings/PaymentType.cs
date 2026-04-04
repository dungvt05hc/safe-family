namespace SafeFamily.Api.Domain.Bookings;

/// <summary>
/// Describes the payment method / flow used for a <see cref="PaymentOrder"/>.
/// Set when the gateway session is opened. Allows filtering and analytics without
/// parsing the raw gateway response.
/// </summary>
public enum PaymentType
{
    /// <summary>
    /// Redirect-based checkout (payOS checkoutUrl, ZaloPay order_url, Stripe hosted page).
    /// The user is sent to a gateway-hosted page and returns via callback.
    /// </summary>
    Redirect = 0,

    /// <summary>
    /// Scan-to-pay QR code (MoMo qrCodeUrl, ZaloPay QR, VNPay QR).
    /// The user scans a QR image displayed in the app or printed receipt.
    /// </summary>
    QrCode = 1,

    /// <summary>
    /// Card-on-file or direct card capture (Stripe card element, VNPay ATM/card).
    /// Payment credentials are entered directly in the client without leaving the app.
    /// </summary>
    Card = 2,

    /// <summary>
    /// Offline bank transfer / wire. Admin marks the order as paid after verifying receipt.
    /// </summary>
    BankTransfer = 3,

    /// <summary>
    /// Admin-recorded cash or manual payment. No gateway involved.
    /// </summary>
    Manual = 4,
}
