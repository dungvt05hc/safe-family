namespace SafeFamily.Api.Domain.Bookings;

/// <summary>
/// Describes how a booking originated — used for analytics and workflow routing.
/// </summary>
public enum BookingSource
{
    /// <summary>Family navigated to the booking flow directly.</summary>
    Direct = 0,

    /// <summary>Booking was initiated as a follow-up to a reported incident.</summary>
    IncidentFollowUp = 1,

    /// <summary>Booking was prompted by an assessment result (e.g. high-risk score).</summary>
    AssessmentFollowUp = 2,

    /// <summary>Referred by a partner organisation or admin staff.</summary>
    Referral = 3,
}
