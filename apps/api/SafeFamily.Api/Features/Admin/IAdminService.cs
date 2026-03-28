using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Domain.Assessments;
using SafeFamily.Api.Domain.Incidents;
using SafeFamily.Api.Domain.Reports;
using SafeFamily.Api.Domain.Users;
using SafeFamily.Api.Features.Admin.Dtos;

namespace SafeFamily.Api.Features.Admin;

public interface IAdminService
{
    Task<AdminDashboardResponse> GetDashboardAsync(CancellationToken ct = default);

    // Customers / Families
    Task<AdminCustomerListResponse> GetCustomerListAsync(
        string? search, RiskLevel? riskLevel, string? planType,
        int page, int pageSize, CancellationToken ct = default);

    Task<AdminCustomerDetailResponse> GetCustomerDetailAsync(
        Guid familyId, CancellationToken ct = default);

    Task<AdminCustomerNoteInfo> AddCustomerNoteAsync(
        Guid familyId, string content, Guid adminId, string adminEmail,
        CancellationToken ct = default);

    // Bookings
    Task<AdminBookingListResponse> GetBookingsPagedAsync(
        string? search, BookingStatus? status, BookingChannel? channel,
        Guid? packageId, DateTimeOffset? from, DateTimeOffset? to,
        int page, int pageSize, CancellationToken ct = default);

    Task<AdminBookingDetailResponse> GetBookingByIdAsync(Guid id, CancellationToken ct = default);

    Task<AdminBookingResponse> UpdatePaymentStatusAsync(Guid bookingId, PaymentStatus newStatus, CancellationToken ct = default);
    Task<AdminBookingResponse> UpdateAdminBookingStatusAsync(Guid bookingId, BookingStatus newStatus, CancellationToken ct = default);

    Task<AdminBookingResponse> AssignBookingAsync(
        Guid id, Guid? adminId, string? adminEmail, CancellationToken ct = default);

    Task<AdminBookingNoteInfo> AddBookingNoteAsync(
        Guid id, string content, Guid authorId, string authorEmail, CancellationToken ct = default);

    // Incidents
    Task<AdminIncidentListResponse> GetIncidentsPagedAsync(
        string? search, IncidentSeverity? severity, IncidentStatus? status, IncidentType? type,
        DateTimeOffset? from, DateTimeOffset? to,
        int page, int pageSize, CancellationToken ct = default);

    Task<AdminIncidentDetailResponse> GetIncidentByIdAsync(Guid id, CancellationToken ct = default);

    Task<AdminIncidentResponse> UpdateIncidentStatusAsync(Guid incidentId, IncidentStatus newStatus, CancellationToken ct = default);

    Task<AdminIncidentNoteInfo> AddIncidentNoteAsync(
        Guid id, string content, Guid authorId, string authorEmail, CancellationToken ct = default);

    // Audit logs
    Task<AuditLogListResponse> GetAuditLogsAsync(int page, int pageSize, CancellationToken ct = default);

    // Activity (filtered audit log)
    Task<AuditLogListResponse> GetActivityAsync(
        string? action, DateTimeOffset? from, DateTimeOffset? to,
        int page, int pageSize, CancellationToken ct = default);

    // Reports
    Task<AdminReportListResponse> GetReportsPagedAsync(
        string? search, ReportType? reportType, Guid? familyId,
        Guid? incidentId, Guid? bookingId,
        DateTimeOffset? from, DateTimeOffset? to,
        int page, int pageSize, CancellationToken ct = default);

    Task<AdminReportDetailResponse> GetReportByIdAsync(Guid id, CancellationToken ct = default);

    // Service Packages (admin management)
    Task<IReadOnlyList<AdminServicePackageResponse>> GetServicePackagesAdminAsync(CancellationToken ct = default);
    Task<AdminServicePackageResponse> CreateServicePackageAsync(CreateServicePackageRequest request, CancellationToken ct = default);
    Task<AdminServicePackageResponse> UpdateServicePackageAsync(Guid id, UpdateServicePackageRequest request, CancellationToken ct = default);
    Task<AdminServicePackageResponse> UpdateServicePackageStatusAsync(Guid id, bool isActive, CancellationToken ct = default);

    // Users
    Task<AdminUserListResponse> GetUsersAsync(
        string? search, UserRole? role, UserStatus? status, bool? emailVerified,
        int page, int pageSize, CancellationToken ct = default);
    Task<AdminUserDetailResponse> GetUserByIdAsync(Guid id, CancellationToken ct = default);

    // User actions
    Task<AdminUserDetailResponse> UpdateUserStatusAsync(Guid id, UserStatus status, Guid adminId, CancellationToken ct = default);
    Task<AdminUserDetailResponse> UpdateUserRoleAsync(Guid id, UserRole role, Guid adminId, CancellationToken ct = default);
    Task<TriggerPasswordResetResponse> TriggerPasswordResetAsync(Guid id, CancellationToken ct = default);

    // Admin Internal Notes
    Task<AdminNoteListResponse> GetAdminNotesAsync(
        Guid? familyId, Guid? bookingId, Guid? incidentId,
        int page, int pageSize, CancellationToken ct = default);

    Task<AdminNoteResponse> CreateAdminNoteAsync(
        CreateAdminNoteRequest request, Guid adminId, string adminEmail,
        CancellationToken ct = default);
}
