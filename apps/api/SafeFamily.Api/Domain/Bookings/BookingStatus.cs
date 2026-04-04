namespace SafeFamily.Api.Domain.Bookings;

/// <summary>
/// Lifecycle states for a booking.
///
/// Allowed transitions:
///   Draft      → Submitted  (family submits the booking request)
///   Submitted  → Paid       (payment confirmed by gateway / admin)
///   Submitted  → Cancelled  (family or admin cancels unpaid booking)
///   Submitted  → Expired    (payment window elapsed)
///   Paid       → Confirmed  (admin accepts the booking after reviewing payment)
///   Paid       → Cancelled  (admin rejects / admin-initiated cancel)
///   Confirmed  → Scheduled  (admin assigns a concrete time slot)
///   Confirmed  → Cancelled
///   Scheduled  → InProgress (session starts)
///   Scheduled  → Cancelled
///   InProgress → Completed  (session ends successfully)
///   InProgress → Cancelled  (emergency cancel mid-session)
///   Any non-terminal → Expired (background expiry job)
///
/// Terminal states: Completed, Cancelled, Expired
///
/// Free packages (SnapshotPrice == 0) skip the Paid step:
///   Submitted → Confirmed directly.
/// </summary>
public enum BookingStatus
{
    Draft      = 0,   // Created; family has not yet submitted
    Submitted  = 1,   // Submitted by family; awaiting payment
    Paid       = 2,   // Payment received; awaiting admin confirmation
    Confirmed  = 3,   // Admin confirmed; awaiting time-slot assignment
    Scheduled  = 4,   // Time slot assigned by admin
    InProgress = 5,   // Session is currently happening
    Completed  = 6,   // Session completed successfully
    Cancelled  = 7,   // Cancelled by family or admin
    Expired    = 8,   // Booking lapsed without action within the allowed window
}
