using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Domain.Common;
using SafeFamily.Api.Domain.Families;
using SafeFamily.Api.Domain.Incidents;

namespace SafeFamily.Api.Domain.Admin;

public class AdminNote : BaseEntity
{
    public string Content { get; set; } = string.Empty;
    public Guid AuthorId { get; set; }
    public string AuthorEmail { get; set; } = string.Empty;

    // Optional associations — at least one should be set
    public Guid? FamilyId { get; set; }
    public Guid? BookingId { get; set; }
    public Guid? IncidentId { get; set; }

    // Navigation properties
    public Family? Family { get; set; }
    public Booking? Booking { get; set; }
    public Incident? Incident { get; set; }
}
