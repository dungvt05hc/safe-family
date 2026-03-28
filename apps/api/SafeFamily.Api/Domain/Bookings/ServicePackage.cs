using SafeFamily.Api.Domain.Common;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Domain.Bookings;

/// <summary>
/// A service package that families can book.
/// Seeded at startup — not editable by end-users.
/// </summary>
public class ServicePackage : BaseEntity
{
    /// <summary>
    /// Human-friendly package code used by admins and reports (e.g. "SAFE-CORE").
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Display title shown in UIs. Existing consumers still read this as Name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    /// <summary>Base package price amount.</summary>
    public decimal Price { get; set; }

    /// <summary>ISO-like currency code (USD, EUR, ...).</summary>
    public string Currency { get; set; } = "USD";

    /// <summary>Planned package duration in minutes.</summary>
    public int DurationMinutes { get; set; }

    /// <summary>Controls whether this package can be selected in booking flows.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>Controls whether this package is visible in public package lists.</summary>
    public bool IsVisible { get; set; } = true;

    /// <summary>Display price string, e.g. "Free", "$99 / session".</summary>
    public string PriceDisplay { get; set; } = string.Empty;

    /// <summary>Duration label shown in the UI, e.g. "60 min".</summary>
    public string DurationLabel { get; set; } = string.Empty;

    public ICollection<Booking> Bookings { get; set; } = [];
}
