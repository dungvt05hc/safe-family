using SafeFamily.Api.Domain.Common;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Domain.Assessments;

/// <summary>
/// A single completed digital safety assessment for a family.
/// Stores composite score data alongside the individual question answers.
/// </summary>
public class Assessment : AuditableEntity
{
    public Guid FamilyId { get; set; }

    // ── Scores (persisted for historical reporting) ──────────────────────────
    public int OverallScore { get; set; }
    public int AccountSecurityScore { get; set; }
    public int DeviceHygieneScore { get; set; }
    public int BackupRecoveryScore { get; set; }
    public int PrivacySharingScore { get; set; }
    public int ScamReadinessScore { get; set; }
    public RiskLevel RiskLevel { get; set; }

    // ── Navigation ─────────────────────────────────────────────────────────────
    public Family Family { get; set; } = null!;
    public ICollection<AssessmentAnswer> Answers { get; set; } = [];
}
