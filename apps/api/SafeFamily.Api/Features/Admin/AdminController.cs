using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SafeFamily.Api.Common.Services;
using SafeFamily.Api.Domain.Assessments;
using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Domain.Incidents;
using SafeFamily.Api.Domain.Reports;
using SafeFamily.Api.Domain.Users;
using SafeFamily.Api.Features.Admin.Dtos;

namespace SafeFamily.Api.Features.Admin;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly IAuditLogService _audit;

    public AdminController(IAdminService adminService, IAuditLogService audit)
    {
        _adminService = adminService;
        _audit = audit;
    }

    // GET /api/admin/dashboard
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(AdminDashboardResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboard(CancellationToken ct)
    {
        var dashboard = await _adminService.GetDashboardAsync(ct);
        return Ok(dashboard);
    }

    // GET /api/admin/customers?search=&riskLevel=&planType=&page=1&pageSize=25
    [HttpGet("customers")]
    [ProducesResponseType(typeof(AdminCustomerListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetCustomers(
        [FromQuery] string? search = null,
        [FromQuery] RiskLevel? riskLevel = null,
        [FromQuery] string? planType = null,
        [FromQuery][Range(1, int.MaxValue)] int page = 1,
        [FromQuery][Range(1, 200)] int pageSize = 25,
        CancellationToken ct = default)
    {
        var result = await _adminService.GetCustomerListAsync(search, riskLevel, planType, page, pageSize, ct);
        return Ok(result);
    }

    // GET /api/admin/customers/{familyId}
    [HttpGet("customers/{familyId:guid}")]
    [ProducesResponseType(typeof(AdminCustomerDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCustomerDetail(Guid familyId, CancellationToken ct)
    {
        var detail = await _adminService.GetCustomerDetailAsync(familyId, ct);
        return Ok(detail);
    }

    // POST /api/admin/customers/{familyId}/notes
    [HttpPost("customers/{familyId:guid}/notes")]
    [ProducesResponseType(typeof(AdminCustomerNoteInfo), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddCustomerNote(
        Guid familyId,
        [FromBody] AddCustomerNoteRequest request,
        CancellationToken ct)
    {
        var adminId    = GetUserId();
        var adminEmail = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
        var note = await _adminService.AddCustomerNoteAsync(familyId, request.Content, adminId, adminEmail, ct);
        await _audit.LogAsync("AdminCustomerNoteAdded", adminId,
            entityType: "Family", entityId: familyId,
            details: "Internal note added",
            ipAddress: GetIp(), ct: ct);
        // No individual-note GET endpoint exists — return 201 with body only.
        return StatusCode(StatusCodes.Status201Created, note);
    }

    // GET /api/admin/bookings?search=&status=&channel=&packageId=&from=&to=&page=1&pageSize=25
    [HttpGet("bookings")]
    [ProducesResponseType(typeof(AdminBookingListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetBookings(
        [FromQuery] string? search = null,
        [FromQuery] BookingStatus? status = null,
        [FromQuery] BookingChannel? channel = null,
        [FromQuery] Guid? packageId = null,
        [FromQuery] DateTimeOffset? from = null,
        [FromQuery] DateTimeOffset? to = null,
        [FromQuery][Range(1, int.MaxValue)] int page = 1,
        [FromQuery][Range(1, 200)] int pageSize = 25,
        CancellationToken ct = default)
    {
        var result = await _adminService.GetBookingsPagedAsync(
            search, status, channel, packageId, from, to, page, pageSize, ct);
        return Ok(result);
    }

    // GET /api/admin/bookings/{id}
    [HttpGet("bookings/{id:guid}")]
    [ProducesResponseType(typeof(AdminBookingDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBookingById(Guid id, CancellationToken ct)
    {
        var detail = await _adminService.GetBookingByIdAsync(id, ct);
        return Ok(detail);
    }

    // PATCH /api/admin/bookings/{id}/status  — update booking lifecycle status
    [HttpPatch("bookings/{id:guid}/status")]
    [ProducesResponseType(typeof(AdminBookingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBookingStatus(Guid id, [FromBody] UpdateAdminBookingStatusRequest request, CancellationToken ct)
    {
        var booking = await _adminService.UpdateAdminBookingStatusAsync(id, request.Status, ct);
        var adminId = GetUserId();
        await _audit.LogAsync("AdminBookingStatusChanged", adminId,
            entityType: "Booking", entityId: id,
            details: $"Status changed to {request.Status}",
            ipAddress: GetIp(), ct: ct);
        return Ok(booking);
    }

    // PATCH /api/admin/bookings/{id}/payment-status  — update payment status
    [HttpPatch("bookings/{id:guid}/payment-status")]
    [ProducesResponseType(typeof(AdminBookingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBookingPaymentStatus(Guid id, [FromBody] UpdateBookingPaymentStatusRequest request, CancellationToken ct)
    {
        var booking = await _adminService.UpdatePaymentStatusAsync(id, request.Status, ct);
        var adminId = GetUserId();
        await _audit.LogAsync("AdminBookingPaymentStatusChanged", adminId,
            entityType: "Booking", entityId: id,
            details: $"PaymentStatus changed to {request.Status}",
            ipAddress: GetIp(), ct: ct);
        return Ok(booking);
    }

    // PATCH /api/admin/bookings/{id}/assign
    [HttpPatch("bookings/{id:guid}/assign")]
    [ProducesResponseType(typeof(AdminBookingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AssignBooking(Guid id, [FromBody] AssignBookingRequest request, CancellationToken ct)
    {
        var booking = await _adminService.AssignBookingAsync(id, request.AssignedAdminId, request.AssignedAdminEmail, ct);
        var adminId = GetUserId();
        var detail  = request.AssignedAdminEmail is null ? "Unassigned" : $"Assigned to {request.AssignedAdminEmail}";
        await _audit.LogAsync("AdminBookingAssigned", adminId,
            entityType: "Booking", entityId: id,
            details: detail,
            ipAddress: GetIp(), ct: ct);
        return Ok(booking);
    }

    // POST /api/admin/bookings/{id}/notes
    [HttpPost("bookings/{id:guid}/notes")]
    [ProducesResponseType(typeof(AdminBookingNoteInfo), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddBookingNote(
        Guid id,
        [FromBody] AddBookingNoteRequest request,
        CancellationToken ct)
    {
        var adminId    = GetUserId();
        var adminEmail = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
        var note = await _adminService.AddBookingNoteAsync(id, request.Content, adminId, adminEmail, ct);
        await _audit.LogAsync("AdminBookingNoteAdded", adminId,
            entityType: "Booking", entityId: id,
            details: "Internal note added",
            ipAddress: GetIp(), ct: ct);
        return StatusCode(StatusCodes.Status201Created, note);
    }

    // GET /api/admin/incidents?search=&severity=&status=&type=&from=&to=&page=1&pageSize=25
    [HttpGet("incidents")]
    [ProducesResponseType(typeof(AdminIncidentListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetIncidents(
        [FromQuery] string? search = null,
        [FromQuery] IncidentSeverity? severity = null,
        [FromQuery] IncidentStatus? status = null,
        [FromQuery] IncidentType? type = null,
        [FromQuery] DateTimeOffset? from = null,
        [FromQuery] DateTimeOffset? to = null,
        [FromQuery][Range(1, int.MaxValue)] int page = 1,
        [FromQuery][Range(1, 200)] int pageSize = 25,
        CancellationToken ct = default)
    {
        var result = await _adminService.GetIncidentsPagedAsync(
            search, severity, status, type, from, to, page, pageSize, ct);
        return Ok(result);
    }

    // GET /api/admin/incidents/{id}
    [HttpGet("incidents/{id:guid}")]
    [ProducesResponseType(typeof(AdminIncidentDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetIncidentById(Guid id, CancellationToken ct)
    {
        var detail = await _adminService.GetIncidentByIdAsync(id, ct);
        return Ok(detail);
    }

    // PATCH /api/admin/incidents/{id}/status
    [HttpPatch("incidents/{id:guid}/status")]
    [ProducesResponseType(typeof(AdminIncidentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateIncidentStatus(Guid id, [FromBody] UpdateIncidentStatusRequest request, CancellationToken ct)
    {
        var incident = await _adminService.UpdateIncidentStatusAsync(id, request.Status, ct);
        var adminId = GetUserId();
        await _audit.LogAsync("AdminIncidentStatusChanged", adminId,
            entityType: "Incident", entityId: id,
            details: $"Status changed to {request.Status}",
            ipAddress: GetIp(), ct: ct);
        return Ok(incident);
    }

    // POST /api/admin/incidents/{id}/notes
    [HttpPost("incidents/{id:guid}/notes")]
    [ProducesResponseType(typeof(AdminIncidentNoteInfo), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddIncidentNote(
        Guid id,
        [FromBody] AddIncidentNoteRequest request,
        CancellationToken ct)
    {
        var adminId    = GetUserId();
        var adminEmail = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
        var note = await _adminService.AddIncidentNoteAsync(id, request.Content, adminId, adminEmail, ct);
        await _audit.LogAsync("AdminIncidentNoteAdded", adminId,
            entityType: "Incident", entityId: id,
            details: "Internal note added",
            ipAddress: GetIp(), ct: ct);
        return StatusCode(StatusCodes.Status201Created, note);
    }

    // GET /api/admin/audit-logs?page=1&pageSize=50
    [HttpGet("audit-logs")]
    [ProducesResponseType(typeof(AuditLogListResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var result = await _adminService.GetAuditLogsAsync(page, pageSize, ct);
        return Ok(result);
    }

    // ── Reports ─────────────────────────────────────────────────────────────────

    // GET /api/admin/reports?search=&reportType=&familyId=&incidentId=&bookingId=&from=&to=&page=1&pageSize=25
    [HttpGet("reports")]
    [ProducesResponseType(typeof(AdminReportListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetReports(
        [FromQuery] string? search = null,
        [FromQuery] ReportType? reportType = null,
        [FromQuery] Guid? familyId = null,
        [FromQuery] Guid? incidentId = null,
        [FromQuery] Guid? bookingId = null,
        [FromQuery] DateTimeOffset? from = null,
        [FromQuery] DateTimeOffset? to = null,
        [FromQuery][Range(1, int.MaxValue)] int page = 1,
        [FromQuery][Range(1, 200)] int pageSize = 25,
        CancellationToken ct = default)
    {
        var result = await _adminService.GetReportsPagedAsync(
            search, reportType, familyId, incidentId, bookingId, from, to, page, pageSize, ct);
        return Ok(result);
    }

    // GET /api/admin/reports/{id}
    [HttpGet("reports/{id:guid}")]
    [ProducesResponseType(typeof(AdminReportDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetReportById(Guid id, CancellationToken ct)
    {
        var detail = await _adminService.GetReportByIdAsync(id, ct);
        return Ok(detail);
    }

    // GET /api/admin/reports/{id}/download — redirect to the stored FileUrl
    [HttpGet("reports/{id:guid}/download")]
    [ProducesResponseType(StatusCodes.Status302Found)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DownloadReport(Guid id, CancellationToken ct)
    {
        var detail = await _adminService.GetReportByIdAsync(id, ct);
        if (string.IsNullOrEmpty(detail.FileUrl))
            return NotFound(new { error = "No file is attached to this report." });
        return Redirect(detail.FileUrl);
    }

    // ── Service Packages ─────────────────────────────────────────────────────────

    // GET /api/admin/service-packages
    [HttpGet("service-packages")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminServicePackageResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetServicePackages(CancellationToken ct)
    {
        var packages = await _adminService.GetServicePackagesAdminAsync(ct);
        return Ok(packages);
    }

    // POST /api/admin/service-packages
    [HttpPost("service-packages")]
    [ProducesResponseType(typeof(AdminServicePackageResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateServicePackage(
        [FromBody] CreateServicePackageRequest request,
        CancellationToken ct)
    {
        var package = await _adminService.CreateServicePackageAsync(request, ct);
        var adminId = GetUserId();
        await _audit.LogAsync("AdminServicePackageCreated", adminId,
            entityType: "ServicePackage", entityId: package.Id,
            details: $"Created package: {package.Title} ({package.Code})",
            ipAddress: GetIp(), ct: ct);
        return Created($"/api/admin/service-packages/{package.Id}", package);
    }

    // PUT /api/admin/service-packages/{id}
    [HttpPut("service-packages/{id:guid}")]
    [ProducesResponseType(typeof(AdminServicePackageResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateServicePackage(
        Guid id,
        [FromBody] UpdateServicePackageRequest request,
        CancellationToken ct)
    {
        var package = await _adminService.UpdateServicePackageAsync(id, request, ct);
        var adminId = GetUserId();
        await _audit.LogAsync("AdminServicePackageUpdated", adminId,
            entityType: "ServicePackage", entityId: id,
            details: $"Updated package: {package.Title} ({package.Code})",
            ipAddress: GetIp(), ct: ct);
        return Ok(package);
    }

    // PATCH /api/admin/service-packages/{id}/status
    [HttpPatch("service-packages/{id:guid}/status")]
    [ProducesResponseType(typeof(AdminServicePackageResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateServicePackageStatus(
        Guid id,
        [FromBody] UpdateServicePackageStatusRequest request,
        CancellationToken ct)
    {
        var package = await _adminService.UpdateServicePackageStatusAsync(id, request.IsActive!.Value, ct);
        var adminId = GetUserId();
        await _audit.LogAsync("AdminServicePackageStatusUpdated", adminId,
            entityType: "ServicePackage", entityId: id,
            details: package.IsActive ? $"Activated package: {package.Title} ({package.Code})" : $"Deactivated package: {package.Title} ({package.Code})",
            ipAddress: GetIp(), ct: ct);
        return Ok(package);
    }

    // ── Admin Users ─────────────────────────────────────────────────────────────

    // GET /api/admin/users
    [HttpGet("users")]
    [ProducesResponseType(typeof(AdminUserListResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search = null,
        [FromQuery] UserRole? role = null,
        [FromQuery] UserStatus? status = null,
        [FromQuery] bool? emailVerified = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        CancellationToken ct = default)
    {
        var result = await _adminService.GetUsersAsync(search, role, status, emailVerified, page, pageSize, ct);
        return Ok(result);
    }

    // GET /api/admin/users/{id}
    [HttpGet("users/{id:guid}")]
    [ProducesResponseType(typeof(AdminUserDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserById(Guid id, CancellationToken ct)
    {
        var user = await _adminService.GetUserByIdAsync(id, ct);
        return Ok(user);
    }

    // PATCH /api/admin/users/{id}/status
    [HttpPatch("users/{id:guid}/status")]
    [ProducesResponseType(typeof(AdminUserDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserStatus(
        Guid id,
        [FromBody] UpdateUserStatusRequest request,
        CancellationToken ct)
    {
        var adminId = GetUserId();
        var user = await _adminService.UpdateUserStatusAsync(id, request.Status, adminId, ct);
        await _audit.LogAsync("AdminUserStatusChanged", adminId,
            entityType: "User", entityId: id,
            details: $"Status changed to {request.Status}",
            ipAddress: GetIp(), ct: ct);
        return Ok(user);
    }

    // PATCH /api/admin/users/{id}/role
    [HttpPatch("users/{id:guid}/role")]
    [ProducesResponseType(typeof(AdminUserDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserRole(
        Guid id,
        [FromBody] UpdateUserRoleRequest request,
        CancellationToken ct)
    {
        var adminId = GetUserId();
        var user = await _adminService.UpdateUserRoleAsync(id, request.Role, adminId, ct);
        await _audit.LogAsync("AdminUserRoleChanged", adminId,
            entityType: "User", entityId: id,
            details: $"Role changed to {request.Role}",
            ipAddress: GetIp(), ct: ct);
        return Ok(user);
    }

    // POST /api/admin/users/{id}/trigger-password-reset
    [HttpPost("users/{id:guid}/trigger-password-reset")]
    [ProducesResponseType(typeof(TriggerPasswordResetResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> TriggerPasswordReset(Guid id, CancellationToken ct)
    {
        var adminId = GetUserId();
        var result = await _adminService.TriggerPasswordResetAsync(id, ct);
        await _audit.LogAsync("AdminPasswordResetTriggered", adminId,
            entityType: "User", entityId: id,
            details: "Admin triggered password reset",
            ipAddress: GetIp(), ct: ct);
        return Ok(result);
    }

    // ── Activity (filtered audit log) ──────────────────────────────────────

    // GET /api/admin/activity?action=&from=&to=&page=1&pageSize=50
    [HttpGet("activity")]
    [ProducesResponseType(typeof(AuditLogListResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActivity(
        [FromQuery] string? action = null,
        [FromQuery] DateTimeOffset? from = null,
        [FromQuery] DateTimeOffset? to = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var result = await _adminService.GetActivityAsync(action, from, to, page, pageSize, ct);
        return Ok(result);
    }

    // ── Admin Internal Notes ────────────────────────────────────────────────

    // GET /api/admin/notes
    [HttpGet("notes")]
    [ProducesResponseType(typeof(AdminNoteListResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAdminNotes(
        [FromQuery] Guid? familyId,
        [FromQuery] Guid? bookingId,
        [FromQuery] Guid? incidentId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var notes = await _adminService.GetAdminNotesAsync(familyId, bookingId, incidentId, page, pageSize, ct);
        return Ok(notes);
    }

    // POST /api/admin/notes
    [HttpPost("notes")]
    [ProducesResponseType(typeof(AdminNoteResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateAdminNote(
        [FromBody] CreateAdminNoteRequest request,
        CancellationToken ct)
    {
        var adminId    = GetUserId();
        var adminEmail = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
        var note = await _adminService.CreateAdminNoteAsync(request, adminId, adminEmail, ct);
        await _audit.LogAsync("AdminNoteCreated", adminId,
            entityType: "AdminNote", entityId: note.Id,
            details: $"Admin note created for {note.EntityType}",
            ipAddress: GetIp(), ct: ct);
        return StatusCode(StatusCodes.Status201Created, note);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private string? GetIp() =>
        HttpContext.Connection.RemoteIpAddress?.ToString();
}
