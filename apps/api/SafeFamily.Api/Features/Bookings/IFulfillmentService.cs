using SafeFamily.Api.Domain.Bookings;

namespace SafeFamily.Api.Features.Bookings;

public interface IFulfillmentService
{
    /// <summary>
    /// Creates placeholder digital deliverables (Report + ChecklistItems) for the given booking
    /// and sets <see cref="Booking.DeliveryStatus"/> to <see cref="DeliveryStatus.Processing"/>.
    ///
    /// This method is idempotent — if <see cref="Booking.DeliveryStatus"/> is already beyond
    /// <see cref="DeliveryStatus.Pending"/> the call is a no-op.
    /// </summary>
    Task TriggerAsync(Booking booking, CancellationToken ct = default);
}
