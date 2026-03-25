using SafeFamily.Api.Domain.Common;

namespace SafeFamily.Api.Domain.Assessments;

/// <summary>
/// A single answer to one question in an <see cref="Assessment"/>.
/// The questionId corresponds to a seeded <see cref="AssessmentQuestion"/> definition.
/// </summary>
public class AssessmentAnswer : BaseEntity
{
    public Guid AssessmentId { get; set; }

    /// <summary>Matches <see cref="AssessmentQuestion.Id"/>.</summary>
    public string QuestionId { get; set; } = string.Empty;

    /// <summary>
    /// Integer score from 0 to 100 for this question.
    /// Derived from the chosen option's weight by RiskScoringService.
    /// </summary>
    public int Score { get; set; }

    // ── Navigation ─────────────────────────────────────────────────────────────
    public Assessment Assessment { get; set; } = null!;
}
