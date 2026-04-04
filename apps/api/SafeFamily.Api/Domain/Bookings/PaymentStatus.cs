namespace SafeFamily.Api.Domain.Bookings;

/// <summary>
/// Payment lifecycle states stored on both <see cref="PaymentOrder"/> and
/// denormalised on <see cref="Booking.PaymentStatus"/> for fast queries.
///
/// Allowed transitions:
///   Unpaid           → Pending           (payment session initiated)
///   Pending          → Paid              (gateway confirms capture)
///   Pending          → Failed            (gateway rejects / bank decline)
///   Pending          → Expired           (payment TTL elapsed with no response)
///   Paid             → Refunded          (full refund issued)
///   Paid             → PartiallyRefunded (partial refund issued)
/// </summary>
public enum PaymentStatus
{
    Unpaid           = 0,   // No payment order created yet
    Pending          = 1,   // Payment session initiated; awaiting gateway callback
    Paid             = 2,   // Payment captured successfully
    Failed           = 3,   // Payment attempt rejected
    Expired          = 4,   // Payment window elapsed without capture
    Refunded         = 5,   // Full refund issued
    PartiallyRefunded = 6,  // Partial refund issued
}
