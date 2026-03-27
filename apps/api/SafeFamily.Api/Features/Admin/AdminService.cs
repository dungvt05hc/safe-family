using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Domain.Incidents;
using SafeFamily.Api.Features.Admin.Dtos;

namespace SafeFamily.Api.Features.Admin;

public class AdminService : IAdminService
{
    private readonly AppDbContext _db;

    public AdminService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<AdminDashboardResponse> GetDashboardAsync(CancellationToken ct = default)
    {
        var totalUsers     = await _db.Users.CountAsync(ct);
        var totalFamilies  = await _db.Families.CountAsync(ct);
        var totalBookings  = await _db.Bookings.CountAsync(ct);
        var totalIncidents = await _db.Incidents.CountAsync(ct);
        var openIncidents  = await _db.Incidents.CountAsync(i => i.Status == IncidentStatus.Open, ct);
        var pendingBookings = await _db.Bookings.CountAsync(b => b.PaymentStatus == PaymentStatus.Pending, ct);

        var recentAuditLogs = await _db.AuditLogs
            .OrderByDescending(l => l.CreatedAt)
            .Take(20)
            .Select(l => new AuditLogEntryResponse(
                l.Id, l.Action, l.UserId, l.UserEmail,
                l.EntityType, l.EntityId, l.Details, l.CreatedAt))
            .ToListAsync(ct);

        return new AdminDashboardResponse(
            totalUsers, totalFamilies, totalBookings, totalIncidents,
            openIncidents, pendingBookings, recentAuditLogs);
    }

    public async Task<IReadOnlyList<AdminCustomerResponse>> GetCustomersAsync(CancellationToken ct = default)
    {
        return await _db.Users
            .OrderBy(u => u.CreatedAt)
            .Select(u => new AdminCustomerResponse(
                u.Id,
                u.Email,
                u.DisplayName,
                u.Role,
                _db.FamilyMembers.Count(fm => fm.UserId == u.Id),
                u.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<AdminBookingResponse>> GetBookingsAsync(CancellationToken ct = default)
    {
        return await _db.Bookings
            .Include(b => b.Family)
            .Include(b => b.Package)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new AdminBookingResponse(
                b.Id, b.FamilyId, b.Family.DisplayName,
                b.PackageId, b.Package.Name,
                b.PreferredStartAt, b.Channel, b.Notes, b.Status, b.PaymentStatus, b.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<AdminBookingResponse> UpdateBookingStatusAsync(Guid bookingId, PaymentStatus newStatus, CancellationToken ct = default)
    {
        var booking = await _db.Bookings
            .Include(b => b.Family)
            .Include(b => b.Package)
            .FirstOrDefaultAsync(b => b.Id == bookingId, ct);

        if (booking is null)
            throw new NotFoundException("Booking", bookingId);

        booking.PaymentStatus = newStatus;
        await _db.SaveChangesAsync(ct);

        return new AdminBookingResponse(
            booking.Id, booking.FamilyId, booking.Family.DisplayName,
            booking.PackageId, booking.Package.Name,
            booking.PreferredStartAt, booking.Channel, booking.Notes, booking.Status, booking.PaymentStatus, booking.CreatedAt);
    }

    public async Task<AdminBookingResponse> UpdateAdminBookingStatusAsync(Guid bookingId, BookingStatus newStatus, CancellationToken ct = default)
    {
        var booking = await _db.Bookings
            .Include(b => b.Family)
            .Include(b => b.Package)
            .FirstOrDefaultAsync(b => b.Id == bookingId, ct);

        if (booking is null)
            throw new NotFoundException("Booking", bookingId);

        booking.Status = newStatus;
        await _db.SaveChangesAsync(ct);

        return new AdminBookingResponse(
            booking.Id, booking.FamilyId, booking.Family.DisplayName,
            booking.PackageId, booking.Package.Name,
            booking.PreferredStartAt, booking.Channel, booking.Notes, booking.Status, booking.PaymentStatus, booking.CreatedAt);
    }

    public async Task<IReadOnlyList<AdminIncidentResponse>> GetIncidentsAsync(CancellationToken ct = default)
    {
        return await _db.Incidents
            .Include(i => i.Family)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new AdminIncidentResponse(
                i.Id, i.FamilyId, i.Family.DisplayName,
                i.Type, i.Severity, i.Status, i.Summary, i.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<AdminIncidentResponse> UpdateIncidentStatusAsync(Guid incidentId, IncidentStatus newStatus, CancellationToken ct = default)
    {
        var incident = await _db.Incidents
            .Include(i => i.Family)
            .FirstOrDefaultAsync(i => i.Id == incidentId, ct);

        if (incident is null)
            throw new NotFoundException("Incident", incidentId);

        incident.Status = newStatus;
        await _db.SaveChangesAsync(ct);

        return new AdminIncidentResponse(
            incident.Id, incident.FamilyId, incident.Family.DisplayName,
            incident.Type, incident.Severity, incident.Status, incident.Summary, incident.CreatedAt);
    }
}
