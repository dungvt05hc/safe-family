using Microsoft.AspNetCore.Http;

namespace SafeFamily.Api.Features.Payments;

/// <summary>
/// Processes inbound payment gateway webhook callbacks.
/// </summary>
public interface IPaymentWebhookService
{
    /// <summary>
    /// Verifies the webhook signature, parses the payload, and applies the
    /// resulting payment event to the matching <see cref="Domain.Bookings.PaymentOrder"/>
    /// and its parent <see cref="Domain.Bookings.Booking"/> idempotently.
    /// </summary>
    /// <param name="provider">
    /// Lowercase provider identifier from the route (e.g. "payos", "momo", "zalopay", "mock").
    /// Used to look up the correct <see cref="IPaymentGateway"/> implementation.
    /// </param>
    /// <param name="headers">HTTP request headers — passed to the gateway for signature verification.</param>
    /// <param name="rawBody">The exact raw request body bytes as a UTF-8 string.
    /// Must not be modified; signature verification depends on the original bytes.</param>
    /// <returns>
    /// <c>true</c> when the webhook was authentic and the event was processed (or was a
    /// recognised duplicate and safely ignored). <c>false</c> when signature verification fails.
    /// </returns>
    Task<bool> HandleAsync(
        string provider,
        IHeaderDictionary headers,
        string rawBody,
        CancellationToken ct = default);
}
