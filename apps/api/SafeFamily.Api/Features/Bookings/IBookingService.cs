using SafeFamily.Api.Features.Bookings.Dtos;

namespace SafeFamily.Api.Features.Bookings;

public interface IBookingService
{
    Task<IReadOnlyList<ServicePackageResponse>> GetServicePackagesAsync(CancellationToken ct = default);

    /// <summary>Creates a booking in <see cref="Domain.Bookings.BookingStatus.Draft"/> state.</summary>
    Task<BookingResponse> CreateBookingAsync(Guid userId, CreateBookingRequest request, CancellationToken ct = default);

    /// <summary>
    /// Advances a Draft booking to Submitted and creates a PaymentOrder.
    /// For free packages (SnapshotPrice == 0) the booking is auto-confirmed instead.
    /// </summary>
    Task<BookingResponse> SubmitBookingAsync(Guid userId, Guid bookingId, CancellationToken ct = default);

    Task<IReadOnlyList<BookingResponse>> GetMyBookingsAsync(Guid userId, CancellationToken ct = default);
    Task<BookingResponse?> GetBookingByIdAsync(Guid userId, Guid id, CancellationToken ct = default);
    Task<BookingSummaryResponse> GetBookingSummaryAsync(Guid userId, CancellationToken ct = default);

    /// <summary>Returns the full event log for a booking owned by the requesting user's family.</summary>
    Task<IReadOnlyList<BookingEventResponse>> GetBookingEventsAsync(Guid userId, Guid bookingId, CancellationToken ct = default);
}

