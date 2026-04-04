namespace SafeFamily.Api.Domain.Bookings;

/// <summary>
/// Central registry of all <see cref="BookingEvent.EventType"/> string constants.
///
/// Using typed constants prevents typos, makes filter queries discoverable,
/// and provides a single place to audit the full event vocabulary.
///
/// To add a new event type: add a constant here, then call
///   _db.BookingEvents.Add(new BookingEvent { EventType = BookingEventTypes.X, ... });
/// at the relevant service call site.
/// </summary>
public static class BookingEventTypes
{
    // ── Booking lifecycle ─────────────────────────────────────────────────────

    /// <summary>Booking record created in Draft state by the family.</summary>
    public const string Created    = "booking.created";

    /// <summary>Family submitted the booking (Draft → Submitted). Payment order opened.</summary>
    public const string Submitted  = "booking.submitted";

    /// <summary>Payment confirmed by gateway or admin (→ Paid).</summary>
    public const string Paid       = "booking.paid";

    /// <summary>Admin accepted the booking after payment review (→ Confirmed).</summary>
    public const string Confirmed  = "booking.confirmed";

    /// <summary>Admin assigned a concrete time slot (→ Scheduled).</summary>
    public const string Scheduled  = "booking.scheduled";

    /// <summary>Session started (→ InProgress).</summary>
    public const string InProgress = "booking.in_progress";

    /// <summary>Session completed successfully (→ Completed). CompletedAt is set.</summary>
    public const string Completed  = "booking.completed";

    /// <summary>Booking cancelled by family or admin.</summary>
    public const string Cancelled  = "booking.cancelled";

    /// <summary>Booking expired — payment window elapsed with no successful payment.</summary>
    public const string Expired    = "booking.expired";

    /// <summary>Catch-all for admin-driven status transitions not covered above.</summary>
    public const string StatusChanged = "booking.status_changed";

    // ── Payment ───────────────────────────────────────────────────────────────

    /// <summary>Family opened a new payment session to replace a failed/expired one.</summary>
    public const string PaymentRetried       = "payment.retried";

    /// <summary>Payment gateway session opened (PaymentOrder → Pending).</summary>
    public const string PaymentInitiated     = "payment.initiated";

    /// <summary>Payment captured by gateway webhook (PaymentOrder → Paid).</summary>
    public const string PaymentReceived      = "payment.received";

    /// <summary>Payment rejected or errored by gateway (PaymentOrder → Failed).</summary>
    public const string PaymentFailed        = "payment.failed";

    /// <summary>Payment session expired without capture (PaymentOrder → Expired).</summary>
    public const string PaymentExpired       = "payment.expired";

    /// <summary>Admin manually overrode the payment status.</summary>
    public const string PaymentStatusChanged = "payment.status_changed";

    // ── Admin actions ─────────────────────────────────────────────────────────

    /// <summary>Booking assigned or unassigned to an admin user.</summary>
    public const string AdminAssigned = "admin.assigned";

    /// <summary>An internal admin note was attached to the booking.</summary>
    public const string NoteAdded    = "note.added";

    /// <summary>A report was linked to or unlinked from the booking by admin.</summary>
    public const string ReportLinked  = "report.linked";
}
