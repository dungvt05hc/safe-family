using SafeFamily.Api.Domain.Common;
using SafeFamily.Api.Domain.Families;
using SafeFamily.Api.Domain.Plans;

namespace SafeFamily.Api.Domain.Incidents;

/// <summary>
/// The structured incident recovery pack produced for a family after purchasing
/// the Incident Recovery Pack product.
///
/// Each section is auto-generated from incident-type templates and booking context,
/// then reviewed and refined by a SafeFamily advisor before the final report is issued.
/// </summary>
public class IncidentRecoveryPack : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public Guid BookingId { get; set; }

    /// <summary>
    /// The incident this recovery pack was created in response to.
    /// Null for standalone recovery bookings not linked to a reported incident.
    /// </summary>
    public Guid? LinkedIncidentId { get; set; }

    // ── Content sections ──────────────────────────────────────────────────────

    /// <summary>Plain-language explanation of what likely happened based on incident type and booking context.</summary>
    public string WhatHappened { get; set; } = string.Empty;

    /// <summary>Prioritised list of immediate actions the family should take right now.</summary>
    public string WhatToDoNow { get; set; } = string.Empty;

    /// <summary>Common mistakes to avoid that could worsen the situation during recovery.</summary>
    public string WhatNotToDo { get; set; } = string.Empty;

    /// <summary>Time-sensitive actions the family must complete within the next 24 hours.</summary>
    public string Next24Hours { get; set; } = string.Empty;

    /// <summary>Medium-term recovery actions to complete over the next 7 days.</summary>
    public string Next7Days { get; set; } = string.Empty;

    /// <summary>Current advisor review state of this recovery pack.</summary>
    public PlanStatus Status { get; set; } = PlanStatus.Generated;

    // ── Navigation ─────────────────────────────────────────────────────────────

    public Family Family { get; set; } = null!;
}
