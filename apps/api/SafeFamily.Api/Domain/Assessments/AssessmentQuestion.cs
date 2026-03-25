namespace SafeFamily.Api.Domain.Assessments;

/// <summary>
/// In-memory definition of a single assessment question.
/// Questions are seeded by <see cref="AssessmentQuestionBank"/> — no DB table required.
/// </summary>
public sealed class AssessmentQuestion
{
    public string Id { get; init; } = string.Empty;
    public AssessmentCategory Category { get; init; }
    public string Text { get; init; } = string.Empty;
    public IReadOnlyList<QuestionOption> Options { get; init; } = [];

    /// <summary>Whether the question must be answered (score 0 if missing).</summary>
    public bool IsRequired { get; init; } = true;
}

/// <summary>One selectable choice within a question.</summary>
public sealed class QuestionOption
{
    public string Value { get; init; } = string.Empty;
    public string Label { get; init; } = string.Empty;

    /// <summary>Score weight 0–100 this option contributes to category score.</summary>
    public int Score { get; init; }
}
