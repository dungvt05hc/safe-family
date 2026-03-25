using SafeFamily.Api.Features.Bookings.Dtos;

namespace SafeFamily.Api.Features.Bookings;

public interface IBookingService
{
    Task<IReadOnlyList<ServicePackageResponse>> GetServicePackagesAsync(CancellationToken ct = default);
    Task<BookingResponse> CreateBookingAsync(Guid userId, CreateBookingRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<BookingResponse>> GetMyBookingsAsync(Guid userId, CancellationToken ct = default);
}
