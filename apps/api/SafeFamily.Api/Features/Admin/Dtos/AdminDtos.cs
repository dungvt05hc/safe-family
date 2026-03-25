using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Domain.Incidents;
using SafeFamily.Api.Domain.Users;

namespace SafeFamily.Api.Features.Admin.Dtos;

// ── Dashboard ────────────────────────────────────────────────────────────────
public record AdminDashboardResponse(
    int TotalUsers,
    int TotalFamilies,
    int TotalBookings,
    int TotalIncidents,
    int OpenIncidents,
    int PendingBookings,
    IReadOnlyList<AuditLogEntryResponse> RecentAuditLogs);

// ── Customers ────────────────────────────────────────────────────────────────
public record AdminCustomerResponse(
    Guid Id,
    string Email,
    string DisplayName,
    UserRole Role,
    int FamilyCount,
    DateTimeOffset CreatedAt);

// ── Bookings ─────────────────────────────────────────────────────────────────
public record AdminBookingResponse(
    Guid Id,
    Guid FamilyId,
    string FamilyName,
    Guid PackageId,
    string PackageName,
    DateTimeOffset PreferredStartAt,
    BookingChannel Channel,
    string? Notes,
    PaymentStatus PaymentStatus,
    DateTimeOffset CreatedAt);

public class UpdateBookingStatusRequest
{
    public required PaymentStatus Status { get; set; }
}

// ── Incidents ────────────────────────────────────────────────────────────────
public record AdminIncidentResponse(
    Guid Id,
    Guid FamilyId,
    string FamilyName,
    IncidentType Type,
    IncidentSeverity Severity,
    IncidentStatus Status,
    string Summary,
    DateTimeOffset CreatedAt);

public class UpdateIncidentStatusRequest
{
    public required IncidentStatus Status { get; set; }
}

// ── Audit Log ────────────────────────────────────────────────────────────────
public record AuditLogEntryResponse(
    Guid Id,
    string Action,
    Guid? UserId,
    string? UserEmail,
    string? EntityType,
    Guid? EntityId,
    string? Details,
    DateTimeOffset CreatedAt);
