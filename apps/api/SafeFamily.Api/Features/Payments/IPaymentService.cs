using SafeFamily.Api.Features.Bookings.Dtos;
using SafeFamily.Api.Features.Payments.Dtos;

namespace SafeFamily.Api.Features.Payments;

public interface IPaymentService
{
    /// <summary>
    /// Connects the existing <c>Unpaid</c> PaymentOrder (created by SubmitBookingAsync)
    /// to the active payment gateway and returns the checkout URL and QR code for the frontend.
    ///
    /// State changes:
    ///   PaymentOrder: Unpaid → Pending
    ///   Booking.PaymentStatus: Unpaid → Pending
    ///   Booking.ExpiresAt: set to gateway session expiry
    /// </summary>
    Task<PaymentInitiateResponse> InitiatePaymentAsync(
        Guid userId, Guid bookingId, CancellationToken ct = default);

    /// <summary>
    /// Creates a <em>new</em> PaymentOrder and opens a fresh payment session after
    /// the previous order reached a Failed or Expired terminal state.
    /// The old order is preserved for audit purposes.
    ///
    /// State changes:
    ///   Old PaymentOrder: unchanged (Failed or Expired)
    ///   New PaymentOrder: Unpaid → Pending
    ///   Booking.PaymentStatus: → Pending
    ///   Booking.ExpiresAt: reset to new session expiry
    /// </summary>
    Task<PaymentInitiateResponse> RetryPaymentAsync(
        Guid userId, Guid bookingId, CancellationToken ct = default);

    /// <summary>Returns all PaymentOrders for a booking, ordered newest-first.</summary>
    Task<IReadOnlyList<PaymentOrderResponse>> GetPaymentOrdersAsync(
        Guid userId, Guid bookingId, CancellationToken ct = default);
}
