using SafeFamily.Api.Features.Assessments.Dtos;

namespace SafeFamily.Api.Features.Assessments;

public interface IAssessmentService
{
    IReadOnlyList<AssessmentQuestionDto> GetQuestions();

    Task<AssessmentResponse> CreateAssessmentAsync(
        Guid userId,
        CreateAssessmentRequest request,
        CancellationToken ct = default);

    Task<AssessmentResponse?> GetLatestAssessmentAsync(
        Guid userId,
        CancellationToken ct = default);
}
