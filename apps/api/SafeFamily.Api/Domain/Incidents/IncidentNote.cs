using SafeFamily.Api.Domain.Common;

namespace SafeFamily.Api.Domain.Incidents;

/// <summary>
/// An internal admin note attached to an incident.
/// Notes are append-only — never updated or deleted through the normal API.
/// Visible only to admin staff; never exposed to family users.
/// </summary>
public class IncidentNote : BaseEntity
{
    public Guid IncidentId { get; set; }

    /// <summary>The note body. Max 2000 characters.</summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>Admin user who authored the note.</summary>
    public Guid AuthorId { get; set; }

    /// <summary>Denormalised admin email — shown in the UI without a JOIN.</summary>
    public string AuthorEmail { get; set; } = string.Empty;

    // ── Navigation ─────────────────────────────────────────────────────────────
    public Incident Incident { get; set; } = null!;
}
