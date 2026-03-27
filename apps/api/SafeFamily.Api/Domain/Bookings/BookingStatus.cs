namespace SafeFamily.Api.Domain.Bookings;

public enum BookingStatus
{
    Pending    = 0,   // Awaiting admin confirmation
    Confirmed  = 1,   // Admin has confirmed the session
    InProgress = 2,   // Session is currently happening
    Cancelled  = 3,   // Booking was cancelled
    Completed  = 4,   // Session completed successfully
}
