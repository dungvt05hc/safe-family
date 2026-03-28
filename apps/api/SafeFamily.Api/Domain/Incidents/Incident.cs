using SafeFamily.Api.Domain.Common;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Domain.Incidents;

/// <summary>
/// Records a digital security incident reported by a family member.
/// No sensitive raw credentials or PII beyond summary text are stored.
/// </summary>
public class Incident : AuditableEntity
{
    public Guid FamilyId { get; set; }

    public IncidentType Type { get; set; }
    public IncidentSeverity Severity { get; set; }

    /// <summary>Short human-readable summary of what happened (max 500 chars).</summary>
    public string Summary { get; set; } = string.Empty;

    /// <summary>Recommended first-action plan text sent back to the user.</summary>
    public string? FirstActionPlan { get; set; }

    /// <summary>Workflow status managed by admin staff.</summary>
    public IncidentStatus Status { get; set; } = IncidentStatus.Open;

    // ── Navigation ────────────────────────────────────────────────────────────
    public Family Family { get; set; } = null!;
    public ICollection<IncidentNote> Notes { get; set; } = new List<IncidentNote>();
}
