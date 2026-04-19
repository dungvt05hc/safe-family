using SafeFamily.Api.Domain.Common;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Domain.Plans;

/// <summary>
/// The structured digital safety plan produced for a family after purchasing the
/// Family Safety Plan or Annual Safety Plan package.
///
/// Content is auto-generated at booking fulfillment from the family's latest
/// assessment scores and member profiles, then reviewed by a SafeFamily advisor
/// before the final PDF report is issued.
/// </summary>
public class FamilySafetyPlan : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public Guid BookingId { get; set; }

    // ── Generation metadata ───────────────────────────────────────────────────

    /// <summary>Assessment used to generate risk and priority content. Null if no assessment existed at generation time.</summary>
    public Guid? SourceAssessmentId { get; set; }

    /// <summary>Overall risk score captured at the time of generation (0–100).</summary>
    public int? AssessmentOverallScore { get; set; }

    /// <summary>Risk level string snapshot at generation time (e.g. "High", "Critical").</summary>
    public string? AssessmentRiskLevel { get; set; }

    // ── Content sections (plain text / markdown, advisor-editable) ────────────

    /// <summary>
    /// Ordered list of the family's top digital safety risk areas, derived from assessment
    /// category scores. Formatted as a numbered list with title and explanation per risk.
    /// </summary>
    public string TopRisks { get; set; } = string.Empty;

    /// <summary>
    /// The 3–5 most critical action items for the family to complete within the next 30 days.
    /// </summary>
    public string TopPriorities { get; set; } = string.Empty;

    /// <summary>
    /// Per-family-member action plans tailored to each person's age group and primary
    /// digital ecosystem. Separator: markdown horizontal rule.
    /// </summary>
    public string ActionPlanByMember { get; set; } = string.Empty;

    /// <summary>
    /// Device and account security guidance covering all family devices.
    /// Includes general housekeeping plus platform-specific recommendations.
    /// </summary>
    public string ActionPlanByDevice { get; set; } = string.Empty;

    /// <summary>Current advisor review state of this plan.</summary>
    public PlanStatus Status { get; set; } = PlanStatus.Generated;

    // ── Navigation ─────────────────────────────────────────────────────────────

    public Family Family { get; set; } = null!;
}
