using SafeFamily.Api.Domain.Common;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Domain.Reports;

/// <summary>
/// A generated or uploaded report scoped to a family.
/// May be associated with a booking or incident for traceability.
/// </summary>
public class Report : BaseEntity
{
    public Guid FamilyId { get; set; }

    public Guid? BookingId { get; set; }
    public Guid? IncidentId { get; set; }

    public ReportType ReportType { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    /// <summary>Public URL or relative path to the report file. Nullable for text-only reports.</summary>
    public string? FileUrl { get; set; }

    public DateTimeOffset GeneratedAt { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>User who triggered report generation. Null for system-generated reports.</summary>
    public Guid? CreatedByUserId { get; set; }

    // ── Navigation ─────────────────────────────────────────────────────────────
    public Family Family { get; set; } = null!;
}
