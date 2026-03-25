using SafeFamily.Api.Domain.Common;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Domain.Bookings;

/// <summary>
/// A service package that families can book.
/// Seeded at startup — not editable by end-users.
/// </summary>
public class ServicePackage : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    /// <summary>Display price string, e.g. "Free", "$99 / session".</summary>
    public string PriceDisplay { get; set; } = string.Empty;

    /// <summary>Duration label shown in the UI, e.g. "60 min".</summary>
    public string DurationLabel { get; set; } = string.Empty;

    public ICollection<Booking> Bookings { get; set; } = [];
}
