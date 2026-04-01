using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Features.Bookings.Dtos;

namespace SafeFamily.Api.Features.Bookings;

public class BookingService : IBookingService
{
    private readonly AppDbContext _db;

    public BookingService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<ServicePackageResponse>> GetServicePackagesAsync(CancellationToken ct = default)
    {
        return await _db.ServicePackages
            .Where(p => p.IsVisible && p.IsActive)
            .OrderBy(p => p.CreatedAt)
            .Select(p => new ServicePackageResponse(p.Id, p.Name, p.Description, p.PriceDisplay, p.DurationLabel))
            .ToListAsync(ct);
    }

    public async Task<BookingResponse> CreateBookingAsync(Guid userId, CreateBookingRequest request, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);
        var preferredStartAtUtc = request.PreferredStartAt.ToUniversalTime();

        var packageExists = await _db.ServicePackages
            .AnyAsync(p => p.Id == request.PackageId && p.IsVisible && p.IsActive, ct);
        if (!packageExists)
            throw new NotFoundException("ServicePackage", request.PackageId);

        var booking = new Booking
        {
            FamilyId         = familyId,
            PackageId        = request.PackageId,
            PreferredStartAt = preferredStartAtUtc,
            Channel          = request.Channel,
            Notes            = request.Notes?.Trim(),
            PaymentStatus    = PaymentStatus.Pending,
            CreatedById      = userId,
            UpdatedById      = userId,
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync(ct);

        // Reload with navigation so PackageName is available
        await _db.Entry(booking).Reference(b => b.Package).LoadAsync(ct);

        return ToResponse(booking);
    }

    public async Task<IReadOnlyList<BookingResponse>> GetMyBookingsAsync(Guid userId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        return await _db.Bookings
            .Include(b => b.Package)
            .Where(b => b.FamilyId == familyId)
            .OrderByDescending(b => b.PreferredStartAt)
            .Select(b => ToResponse(b))
            .ToListAsync(ct);
    }

    public async Task<BookingResponse?> GetBookingByIdAsync(Guid userId, Guid id, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var booking = await _db.Bookings
            .Include(b => b.Package)
            .FirstOrDefaultAsync(b => b.Id == id && b.FamilyId == familyId, ct);

        return booking is null ? null : ToResponse(booking);
    }

    public async Task<BookingSummaryResponse> GetBookingSummaryAsync(Guid userId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var now = DateTimeOffset.UtcNow;

        var total = await _db.Bookings.CountAsync(b => b.FamilyId == familyId, ct);

        var upcoming = await _db.Bookings
            .CountAsync(b => b.FamilyId == familyId
                && b.PreferredStartAt > now
                && b.Status != BookingStatus.Cancelled, ct);

        var pendingConfirmations = await _db.Bookings
            .CountAsync(b => b.FamilyId == familyId && b.Status == BookingStatus.Pending, ct);

        var recent = await _db.Bookings
            .Include(b => b.Package)
            .Where(b => b.FamilyId == familyId)
            .OrderByDescending(b => b.CreatedAt)
            .Take(5)
            .Select(b => ToResponse(b))
            .ToListAsync(ct);

        return new BookingSummaryResponse(total, upcoming, pendingConfirmations, recent);
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

    private static BookingResponse ToResponse(Booking b) =>
        new(b.Id, b.FamilyId, b.PackageId, b.Package.Name, b.PreferredStartAt,
            b.Channel, b.Notes, b.Status, b.PaymentStatus, b.CreatedAt, b.UpdatedAt);
}
