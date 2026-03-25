using System.ComponentModel.DataAnnotations;
using SafeFamily.Api.Domain.Bookings;

namespace SafeFamily.Api.Features.Bookings.Dtos;

public record ServicePackageResponse(
    Guid Id,
    string Name,
    string Description,
    string PriceDisplay,
    string DurationLabel);

public record BookingResponse(
    Guid Id,
    Guid FamilyId,
    Guid PackageId,
    string PackageName,
    DateTimeOffset PreferredStartAt,
    BookingChannel Channel,
    string? Notes,
    PaymentStatus PaymentStatus,
    DateTimeOffset CreatedAt);

public class CreateBookingRequest
{
    [Required]
    public Guid PackageId { get; set; }

    [Required]
    public DateTimeOffset PreferredStartAt { get; set; }

    [Required]
    public BookingChannel Channel { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}

public class UpdateBookingStatusRequest
{
    [Required]
    public PaymentStatus Status { get; set; }
}
