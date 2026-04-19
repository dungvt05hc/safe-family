namespace SafeFamily.Api.Domain.Bookings;

/// <summary>
/// How urgently a family needs assistance.
/// Used when purchasing a digital safety product to prioritise delivery and tone.
/// </summary>
public enum BookingUrgency
{
    /// <summary>No immediate threat — the family wants to improve their safety proactively.</summary>
    Routine  = 0,

    /// <summary>Something concerning has happened recently and the family wants to address it soon.</summary>
    Urgent   = 1,

    /// <summary>The family is dealing with an active incident and needs immediate guidance.</summary>
    Critical = 2,
}
