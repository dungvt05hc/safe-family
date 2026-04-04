using SafeFamily.Api.Domain.Common;

namespace SafeFamily.Api.Domain.Bookings;

/// <summary>
/// Immutable audit log of significant state changes on a booking.
/// Records are append-only — never updated or deleted through the normal API.
///
/// Common event types:
///   "StatusChanged"    — BookingStatus changed; FromValue/ToValue hold old/new status strings
///   "PaymentReceived"  — PaymentOrder moved to Paid
///   "PaymentFailed"    — PaymentOrder failed; Description may include gateway reason
///   "PaymentExpired"   — PaymentOrder expired without capture
///   "Refunded"         — Refund issued; Description holds amount and type (full/partial)
///   "AdminAssigned"    — AssignedAdminUserId / AssignedAdminEmail changed
///   "Scheduled"        — ConfirmedStartAt set by admin; ToValue holds the ISO timestamp
///   "NoteAdded"        — A BookingNote was attached by admin
///   "Cancelled"        — Booking cancelled; Description holds the reason
/// </summary>
public class BookingEvent : BaseEntity
{
    public Guid BookingId { get; set; }

    /// <summary>Machine-readable event label (see class summary for known values).</summary>
    public string EventType { get; set; } = string.Empty;

    /// <summary>Previous state or value relevant to the event (e.g. previous BookingStatus string).</summary>
    public string? FromValue { get; set; }

    /// <summary>New state or value after the event (e.g. new BookingStatus string).</summary>
    public string? ToValue { get; set; }

    /// <summary>Optional human-readable description or admin comment for this event.</summary>
    public string? Description { get; set; }

    /// <summary>ID of the user who triggered this event. Null for system-generated events.</summary>
    public Guid? ActorId { get; set; }

    /// <summary>Denormalised email of the actor, for display without a JOIN.</summary>
    public string? ActorEmail { get; set; }

    // ── Navigation ────────────────────────────────────────────────────────────
    public Booking Booking { get; set; } = null!;
}
