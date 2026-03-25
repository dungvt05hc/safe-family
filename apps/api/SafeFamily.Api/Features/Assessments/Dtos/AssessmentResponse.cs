using SafeFamily.Api.Domain.Assessments;

namespace SafeFamily.Api.Features.Assessments.Dtos;

/// <summary>Per-category score included in <see cref="AssessmentResponse"/>.</summary>
public record CategoryScoreDto(
    string Category,
    int Score);

/// <summary>Response payload for POST /api/assessments and GET /api/assessments/latest.</summary>
public record AssessmentResponse(
    Guid Id,
    Guid FamilyId,
    int OverallScore,
    IReadOnlyList<CategoryScoreDto> CategoryScores,
    string RiskLevel,
    IReadOnlyList<string> ImmediateActions,
    DateTimeOffset CreatedAt);
