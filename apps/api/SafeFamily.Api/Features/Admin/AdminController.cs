using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SafeFamily.Api.Common.Services;
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

    // GET /api/admin/customers
    [HttpGet("customers")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminCustomerResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCustomers(CancellationToken ct)
    {
        var customers = await _adminService.GetCustomersAsync(ct);
        return Ok(customers);
    }

    // GET /api/admin/bookings
    [HttpGet("bookings")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminBookingResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBookings(CancellationToken ct)
    {
        var bookings = await _adminService.GetBookingsAsync(ct);
        return Ok(bookings);
    }

    // PATCH /api/admin/bookings/{id}/status
    [HttpPatch("bookings/{id:guid}/status")]
    [ProducesResponseType(typeof(AdminBookingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBookingStatus(Guid id, [FromBody] UpdateBookingStatusRequest request, CancellationToken ct)
    {
        var booking = await _adminService.UpdateBookingStatusAsync(id, request.Status, ct);
        var adminId = GetUserId();
        await _audit.LogAsync("AdminBookingStatusChanged", adminId,
            entityType: "Booking", entityId: id,
            details: $"Status changed to {request.Status}",
            ipAddress: GetIp(), ct: ct);
        return Ok(booking);
    }

    // GET /api/admin/incidents
    [HttpGet("incidents")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminIncidentResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetIncidents(CancellationToken ct)
    {
        var incidents = await _adminService.GetIncidentsAsync(ct);
        return Ok(incidents);
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

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private string? GetIp() =>
        HttpContext.Connection.RemoteIpAddress?.ToString();
}
