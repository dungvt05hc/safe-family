using SafeFamily.Api.Domain.Assessments;

namespace SafeFamily.Api.Features.Assessments.Dtos;

/// <summary>One answer in the assessment submission payload.</summary>
public record AnswerRequest(
    string QuestionId,
    /// <summary>The selected option's <c>Value</c> field from the question definition.</summary>
    string SelectedValue);

/// <summary>POST /api/assessments request body.</summary>
public record CreateAssessmentRequest(
    IReadOnlyList<AnswerRequest> Answers);
