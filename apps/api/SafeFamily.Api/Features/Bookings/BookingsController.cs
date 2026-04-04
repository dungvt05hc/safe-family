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

    // POST /api/bookings  — creates a Draft booking
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
        return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, booking);
    }

    // POST /api/bookings/{id}/submit  — Draft → Submitted (or Confirmed for free packages)
    [HttpPost("api/bookings/{id:guid}/submit")]
    [EnableRateLimiting("mutations")]
    [ProducesResponseType(typeof(BookingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitBooking(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();
        var booking = await _bookingService.SubmitBookingAsync(userId, id, ct);
        await _audit.LogAsync("BookingSubmitted", userId, entityType: "Booking", entityId: booking.Id,
            details: $"Status={booking.Status}", ct: ct);
        return Ok(booking);
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

    // GET /api/bookings/summary
    [HttpGet("api/bookings/summary")]
    [ProducesResponseType(typeof(BookingSummaryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetBookingSummary(CancellationToken ct)
    {
        var summary = await _bookingService.GetBookingSummaryAsync(GetUserId(), ct);
        return Ok(summary);
    }

    // GET /api/bookings/{id}
    [HttpGet("api/bookings/{id:guid}")]
    [ProducesResponseType(typeof(BookingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBooking(Guid id, CancellationToken ct)
    {
        var booking = await _bookingService.GetBookingByIdAsync(GetUserId(), id, ct);
        return booking is null ? NotFound() : Ok(booking);
    }

    // GET /api/bookings/{id}/events
    [HttpGet("api/bookings/{id:guid}/events")]
    [ProducesResponseType(typeof(IReadOnlyList<BookingEventResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBookingEvents(Guid id, CancellationToken ct)
    {
        var events = await _bookingService.GetBookingEventsAsync(GetUserId(), id, ct);
        return Ok(events);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}

