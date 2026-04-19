namespace SafeFamily.Api.Features.Plans.Dtos;

// ── Family Safety Plan ────────────────────────────────────────────────────────

public record FamilySafetyPlanDto(
    Guid   Id,
    Guid   FamilyId,
    Guid   BookingId,
    Guid?  SourceAssessmentId,
    int?   AssessmentOverallScore,
    string? AssessmentRiskLevel,
    string TopRisks,
    string TopPriorities,
    string ActionPlanByMember,
    string ActionPlanByDevice,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

// ── Incident Recovery Pack ────────────────────────────────────────────────────

public record IncidentRecoveryPackDto(
    Guid   Id,
    Guid   FamilyId,
    Guid   BookingId,
    Guid?  LinkedIncidentId,
    string WhatHappened,
    string WhatToDoNow,
    string WhatNotToDo,
    string Next24Hours,
    string Next7Days,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
