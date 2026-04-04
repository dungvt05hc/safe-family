using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Domain.Reports;
using SafeFamily.Api.Features.Bookings.Dtos;

namespace SafeFamily.Api.Features.Bookings;

public class BookingService : IBookingService
{
    private readonly AppDbContext _db;

    public BookingService(AppDbContext db)
    {
        _db = db;
    }

    // ── Service-package catalogue ─────────────────────────────────────────────

    public async Task<IReadOnlyList<ServicePackageResponse>> GetServicePackagesAsync(CancellationToken ct = default)
    {
        return await _db.ServicePackages
            .Where(p => p.IsVisible && p.IsActive)
            .OrderBy(p => p.CreatedAt)
            .Select(p => new ServicePackageResponse(p.Id, p.Name, p.Description, p.PriceDisplay, p.DurationLabel))
            .ToListAsync(ct);
    }

    // ── Create (Draft) ────────────────────────────────────────────────────────

    /// <summary>
    /// Creates a booking in <see cref="BookingStatus.Draft"/> state.
    /// Package details are snapshotted at this point so future edits to the
    /// catalogue do not retroactively change the booking terms.
    /// Call <see cref="SubmitBookingAsync"/> when the family is ready to pay.
    /// </summary>
    public async Task<BookingResponse> CreateBookingAsync(Guid userId, CreateBookingRequest request, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var package = await _db.ServicePackages
            .FirstOrDefaultAsync(p => p.Id == request.PackageId && p.IsVisible && p.IsActive, ct);
        if (package is null)
            throw new NotFoundException("ServicePackage", request.PackageId);

        // Validate source links belong to the same family
        if (request.SourceIncidentId.HasValue)
        {
            var incidentExists = await _db.Incidents
                .AnyAsync(i => i.Id == request.SourceIncidentId && i.FamilyId == familyId, ct);
            if (!incidentExists)
                throw new NotFoundException("Incident", request.SourceIncidentId.Value);
        }

        if (request.SourceAssessmentId.HasValue)
        {
            var assessmentExists = await _db.Assessments
                .AnyAsync(a => a.Id == request.SourceAssessmentId && a.FamilyId == familyId, ct);
            if (!assessmentExists)
                throw new NotFoundException("Assessment", request.SourceAssessmentId.Value);
        }

        var booking = new Booking
        {
            FamilyId                = familyId,
            PackageId               = package.Id,
            // Snapshot — frozen at creation time
            SnapshotPackageName     = package.Name,
            SnapshotPackageCode     = package.Code,
            SnapshotPrice           = package.Price,
            SnapshotCurrency        = package.Currency,
            SnapshotDurationMinutes = package.DurationMinutes,
            // Scheduling
            PreferredStartAt        = request.PreferredStartAt.ToUniversalTime(),
            // Channel & source
            Channel                 = request.Channel,
            Source                  = request.Source,
            SourceIncidentId        = request.SourceIncidentId,
            SourceAssessmentId      = request.SourceAssessmentId,
            // Notes & status
            CustomerNotes           = request.CustomerNotes?.Trim(),
            Status                  = BookingStatus.Draft,
            PaymentStatus           = PaymentStatus.Unpaid,
            // Audit
            CreatedById             = userId,
            UpdatedById             = userId,
        };

        _db.Bookings.Add(booking);

        // Initial event
        _db.BookingEvents.Add(new BookingEvent
        {
            BookingId   = booking.Id,
            EventType   = BookingEventTypes.Created,
            FromValue   = null,
            ToValue     = BookingStatus.Draft.ToString(),
            Description = "Booking created in Draft state.",
            ActorId     = userId,
        });

        await _db.SaveChangesAsync(ct);

        await _db.Entry(booking).Reference(b => b.Package).LoadAsync(ct);
        return ToResponse(booking);
    }

    // ── Submit (Draft → Submitted / Confirmed for free packages) ─────────────

    /// <summary>
    /// Submits a Draft booking for processing.
    ///
    /// Paid packages:  Draft → Submitted  +  creates a PaymentOrder (Unpaid).
    ///                 The family must then complete payment via the payment gateway.
    ///
    /// Free packages:  Draft → Confirmed  (payment step is skipped entirely).
    ///                 No PaymentOrder is created; PaymentStatus stays Unpaid.
    /// </summary>
    public async Task<BookingResponse> SubmitBookingAsync(Guid userId, Guid bookingId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var booking = await _db.Bookings
            .Include(b => b.Package)
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.FamilyId == familyId, ct);

        if (booking is null)
            throw new NotFoundException("Booking", bookingId);

        if (booking.Status != BookingStatus.Draft)
            throw new BadRequestException($"Only Draft bookings can be submitted. Current status: {booking.Status}.");

        var previousStatus = booking.Status;

        if (booking.SnapshotPrice == 0m)
        {
            // Free package — skip payment and confirm immediately
            booking.Status        = BookingStatus.Confirmed;
            booking.PaymentStatus = PaymentStatus.Unpaid; // no payment required

            _db.BookingEvents.Add(new BookingEvent
            {
                BookingId   = booking.Id,
                EventType   = BookingEventTypes.Confirmed,
                FromValue   = previousStatus.ToString(),
                ToValue     = BookingStatus.Confirmed.ToString(),
                Description = "Free package — booking auto-confirmed on submission.",
                ActorId     = userId,
            });
        }
        else
        {
            // Paid package — move to Submitted and create a pending PaymentOrder
            booking.Status        = BookingStatus.Submitted;
            booking.PaymentStatus = PaymentStatus.Unpaid;

            var paymentOrder = new PaymentOrder
            {
                BookingId = booking.Id,
                Amount    = booking.SnapshotPrice,
                Currency  = booking.SnapshotCurrency,
                Status    = PaymentStatus.Unpaid,
            };
            _db.PaymentOrders.Add(paymentOrder);

            _db.BookingEvents.Add(new BookingEvent
            {
                BookingId   = booking.Id,
                EventType   = BookingEventTypes.Submitted,
                FromValue   = previousStatus.ToString(),
                ToValue     = BookingStatus.Submitted.ToString(),
                Description = "Booking submitted by family. Awaiting payment.",
                ActorId     = userId,
            });
        }

        booking.UpdatedById = userId;
        await _db.SaveChangesAsync(ct);

        return ToResponse(booking);
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    public async Task<IReadOnlyList<BookingResponse>> GetMyBookingsAsync(Guid userId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        return await _db.Bookings
            .Include(b => b.Package)
            .Where(b => b.FamilyId == familyId)
            .OrderByDescending(b => b.PreferredStartAt)
            .Select(b => ToResponse(b, null))
            .ToListAsync(ct);
    }

    public async Task<BookingResponse?> GetBookingByIdAsync(Guid userId, Guid id, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var booking = await _db.Bookings
            .Include(b => b.Package)
            .FirstOrDefaultAsync(b => b.Id == id && b.FamilyId == familyId, ct);

        if (booking is null) return null;

        // Load the primary linked report (if one exists) for the detail view.
        var primaryReport = await _db.Reports
            .Where(r => r.BookingId == id)
            .OrderByDescending(r => r.GeneratedAt)
            .Select(r => new BookingReportInfo(r.Id, r.ReportType, r.Title, r.Description, r.FileUrl, r.GeneratedAt))
            .FirstOrDefaultAsync(ct);

        return ToResponse(booking, primaryReport);
    }

    public async Task<BookingSummaryResponse> GetBookingSummaryAsync(Guid userId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);
        var now = DateTimeOffset.UtcNow;

        var total = await _db.Bookings.CountAsync(b => b.FamilyId == familyId, ct);

        // Active upcoming bookings (not cancelled, not expired)
        var upcoming = await _db.Bookings
            .CountAsync(b => b.FamilyId == familyId
                && b.PreferredStartAt > now
                && b.Status != BookingStatus.Cancelled
                && b.Status != BookingStatus.Expired, ct);

        // Bookings submitted but not yet confirmed — awaiting admin action
        var awaitingConfirmation = await _db.Bookings
            .CountAsync(b => b.FamilyId == familyId
                && (b.Status == BookingStatus.Submitted || b.Status == BookingStatus.Paid), ct);

        var recent = await _db.Bookings
            .Include(b => b.Package)
            .Where(b => b.FamilyId == familyId)
            .OrderByDescending(b => b.CreatedAt)
            .Take(5)
            .Select(b => ToResponse(b, null))
            .ToListAsync(ct);

        return new BookingSummaryResponse(total, upcoming, awaitingConfirmation, recent);
    }

    public async Task<IReadOnlyList<BookingEventResponse>> GetBookingEventsAsync(
        Guid userId, Guid bookingId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        // Verify the booking belongs to this family before exposing its events
        var bookingExists = await _db.Bookings
            .AnyAsync(b => b.Id == bookingId && b.FamilyId == familyId, ct);
        if (!bookingExists)
            throw new NotFoundException("Booking", bookingId);

        return await _db.BookingEvents
            .Where(e => e.BookingId == bookingId)
            .OrderBy(e => e.CreatedAt)
            .Select(e => new BookingEventResponse(
                e.Id, e.EventType, e.FromValue, e.ToValue,
                e.Description, e.ActorId, e.ActorEmail, e.CreatedAt))
            .ToListAsync(ct);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<Guid> RequireFamilyIdAsync(Guid userId, CancellationToken ct)
    {
        var familyId = await _db.FamilyMembers
            .Where(m => m.UserId == userId)
            .Select(m => (Guid?)m.FamilyId)
            .FirstOrDefaultAsync(ct);

        if (familyId is null)
            throw new ForbiddenException("You must be part of a family to manage bookings.");

        return familyId.Value;
    }

    private static BookingResponse ToResponse(Booking b, BookingReportInfo? primaryReport = null) =>
        new(b.Id,
            b.FamilyId,
            b.PackageId,
            // Package snapshot
            b.SnapshotPackageName,
            b.SnapshotPackageCode,
            b.SnapshotPrice,
            b.SnapshotCurrency,
            b.SnapshotDurationMinutes,
            // Scheduling
            b.PreferredStartAt,
            b.ConfirmedStartAt,
            b.ConfirmedEndAt,
            // Channel & source
            b.Channel,
            b.Source,
            b.SourceIncidentId,
            b.SourceAssessmentId,
            // Notes & status
            b.CustomerNotes,
            b.Status,
            b.PaymentStatus,
            b.ExpiresAt,
            b.CompletedAt,
            // Admin
            b.AssignedAdminUserId,
            b.AssignedAdminEmail,
            b.CreatedAt,
            b.UpdatedAt,
            primaryReport);
}

