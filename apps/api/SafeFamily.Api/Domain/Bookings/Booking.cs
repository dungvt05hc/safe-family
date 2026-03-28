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

    /// <summary>Admin currently responsible for this booking. Null = unassigned.</summary>
    public Guid? AssignedAdminId { get; set; }

    /// <summary>Denormalised admin email shown in the UI without a JOIN.</summary>
    public string? AssignedAdminEmail { get; set; }

    // ── Navigation ────────────────────────────────────────────────────────────
    public Family Family { get; set; } = null!;
    public ServicePackage Package { get; set; } = null!;
}
