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
            .OrderBy(p => p.CreatedAt)
            .Select(p => new ServicePackageResponse(p.Id, p.Name, p.Description, p.PriceDisplay, p.DurationLabel))
            .ToListAsync(ct);
    }

    public async Task<BookingResponse> CreateBookingAsync(Guid userId, CreateBookingRequest request, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var packageExists = await _db.ServicePackages.AnyAsync(p => p.Id == request.PackageId, ct);
        if (!packageExists)
            throw new NotFoundException("ServicePackage", request.PackageId);

        var booking = new Booking
        {
            FamilyId         = familyId,
            PackageId        = request.PackageId,
            PreferredStartAt = request.PreferredStartAt,
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
            b.Channel, b.Notes, b.PaymentStatus, b.CreatedAt);
}
