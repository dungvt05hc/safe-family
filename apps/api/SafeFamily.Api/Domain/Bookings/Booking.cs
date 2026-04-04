using SafeFamily.Api.Domain.Common;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Domain.Bookings;

/// <summary>
/// A booking made by a family for a service package (e.g. a safety consultation).
///
/// See <see cref="BookingStatus"/> for the full state machine and allowed transitions.
/// </summary>
public class Booking : AuditableEntity
{
    // ── Core refs ─────────────────────────────────────────────────────────────
    public Guid FamilyId { get; set; }
    public Guid PackageId { get; set; }

    // ── Package snapshot (captured at booking creation time) ──────────────────
    // These fields survive package edits and deletions, ensuring the booking
    // always reflects the terms agreed at the time of reservation.

    /// <summary>Package name at the time of booking.</summary>
    public string SnapshotPackageName { get; set; } = string.Empty;

    /// <summary>Package code at the time of booking (e.g. "FAMILY-CORE").</summary>
    public string SnapshotPackageCode { get; set; } = string.Empty;

    /// <summary>Price agreed by the family (may differ from the current package price).</summary>
    public decimal SnapshotPrice { get; set; }

    /// <summary>ISO-4217 currency code at the time of booking.</summary>
    public string SnapshotCurrency { get; set; } = "USD";

    /// <summary>Planned duration in minutes at the time of booking.</summary>
    public int SnapshotDurationMinutes { get; set; }

    // ── Scheduling ────────────────────────────────────────────────────────────
    /// <summary>Preferred session start requested by the family.</summary>
    public DateTimeOffset PreferredStartAt { get; set; }

    /// <summary>Confirmed start time assigned by admin. Null until Scheduled state.</summary>
    public DateTimeOffset? ScheduledStartAt { get; set; }

    /// <summary>Confirmed end time assigned by admin. Null until Scheduled state.</summary>
    public DateTimeOffset? ScheduledEndAt { get; set; }

    // ── Channel & source ──────────────────────────────────────────────────────
    public BookingChannel Channel { get; set; }

    /// <summary>How this booking originated — used for analytics and admin prioritisation.</summary>
    public BookingSource Source { get; set; } = BookingSource.Direct;

    /// <summary>Optional link to an incident that triggered this booking (IncidentFollowUp source).</summary>
    public Guid? SourceIncidentId { get; set; }

    /// <summary>Optional link to an assessment whose results prompted this booking (AssessmentFollowUp source).</summary>
    public Guid? SourceAssessmentId { get; set; }

    // ── Notes & status ────────────────────────────────────────────────────────
    /// <summary>Free-text notes from the family (max 1 000 chars).</summary>
    public string? Notes { get; set; }

    /// <summary>Current booking lifecycle state. See <see cref="BookingStatus"/> for transitions.</summary>
    public BookingStatus Status { get; set; } = BookingStatus.Draft;

    /// <summary>
    /// Denormalised payment status mirroring the latest <see cref="PaymentOrder"/>.
    /// Updated whenever a PaymentOrder state changes so queries avoid an extra JOIN.
    /// </summary>
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;

    /// <summary>Deadline for payment or admin action. Null = no automatic expiry.</summary>
    public DateTimeOffset? ExpiresAt { get; set; }

    // ── Admin assignment ──────────────────────────────────────────────────────
    /// <summary>Admin currently responsible for this booking. Null = unassigned.</summary>
    public Guid? AssignedAdminId { get; set; }

    /// <summary>Denormalised admin email shown in the UI without a JOIN.</summary>
    public string? AssignedAdminEmail { get; set; }

    // ── Navigation ────────────────────────────────────────────────────────────
    public Family Family { get; set; } = null!;
    public ServicePackage Package { get; set; } = null!;
    public ICollection<PaymentOrder> PaymentOrders { get; set; } = [];
    public ICollection<BookingEvent> Events { get; set; } = [];
}
