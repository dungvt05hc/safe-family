namespace SafeFamily.Api.Features.Assessments.Dtos;

/// <summary>Single option presented to the user for a question.</summary>
public record QuestionOptionDto(string Value, string Label);

/// <summary>One question returned by GET /api/assessments/questions.</summary>
public record AssessmentQuestionDto(
    string Id,
    string Category,
    string Text,
    IReadOnlyList<QuestionOptionDto> Options,
    bool IsRequired);
