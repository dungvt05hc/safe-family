using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Domain.Incidents;
using SafeFamily.Api.Features.Admin.Dtos;

namespace SafeFamily.Api.Features.Admin;

public interface IAdminService
{
    Task<AdminDashboardResponse> GetDashboardAsync(CancellationToken ct = default);
    Task<IReadOnlyList<AdminCustomerResponse>> GetCustomersAsync(CancellationToken ct = default);
    Task<IReadOnlyList<AdminBookingResponse>> GetBookingsAsync(CancellationToken ct = default);
    Task<AdminBookingResponse> UpdateBookingStatusAsync(Guid bookingId, PaymentStatus newStatus, CancellationToken ct = default);
    Task<IReadOnlyList<AdminIncidentResponse>> GetIncidentsAsync(CancellationToken ct = default);
    Task<AdminIncidentResponse> UpdateIncidentStatusAsync(Guid incidentId, IncidentStatus newStatus, CancellationToken ct = default);
}
