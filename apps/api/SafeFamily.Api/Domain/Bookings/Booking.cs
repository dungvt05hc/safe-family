using SafeFamily.Api.Domain.Common;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Domain.Bookings;

/// <summary>
/// A booking made by a family for a service package (e.g. a safety consultation).
/// </summary>
public class Booking : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public Guid PackageId { get; set; }

    public DateTimeOffset PreferredStartAt { get; set; }
    public BookingChannel Channel { get; set; }
    public string? Notes { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

    // ── Navigation ────────────────────────────────────────────────────────────
    public Family Family { get; set; } = null!;
    public ServicePackage Package { get; set; } = null!;
}
