using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SafeFamily.Api.Common.Services;
using SafeFamily.Api.Features.Bookings.Dtos;

namespace SafeFamily.Api.Features.Bookings;

[ApiController]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;
    private readonly IAuditLogService _audit;

    public BookingsController(IBookingService bookingService, IAuditLogService audit)
    {
        _bookingService = bookingService;
        _audit = audit;
    }

    // GET /api/service-packages
    [HttpGet("api/service-packages")]
    [ProducesResponseType(typeof(IReadOnlyList<ServicePackageResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetServicePackages(CancellationToken ct)
    {
        var packages = await _bookingService.GetServicePackagesAsync(ct);
        return Ok(packages);
    }

    // POST /api/bookings
    [HttpPost("api/bookings")]
    [EnableRateLimiting("mutations")]
    [ProducesResponseType(typeof(BookingResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        var booking = await _bookingService.CreateBookingAsync(userId, request, ct);
        await _audit.LogAsync("BookingCreated", userId, entityType: "Booking", entityId: booking.Id,
            details: $"Package={booking.PackageName}", ct: ct);
        return CreatedAtAction(nameof(GetMyBookings), booking);
    }

    // GET /api/bookings/my
    [HttpGet("api/bookings/my")]
    [ProducesResponseType(typeof(IReadOnlyList<BookingResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMyBookings(CancellationToken ct)
    {
        var bookings = await _bookingService.GetMyBookingsAsync(GetUserId(), ct);
        return Ok(bookings);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
