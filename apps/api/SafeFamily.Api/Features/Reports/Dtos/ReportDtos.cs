namespace SafeFamily.Api.Features.Reports.Dtos;

public record ReportListItemDto(
    Guid Id,
    string ReportType,
    string Title,
    string Description,
    string? FileUrl,
    DateTimeOffset GeneratedAt,
    Guid? BookingId,
    Guid? IncidentId,
    Guid? CreatedByUserId);

public record ReportDetailDto(
    Guid Id,
    Guid FamilyId,
    string ReportType,
    string Title,
    string Description,
    string? FileUrl,
    DateTimeOffset GeneratedAt,
    Guid? BookingId,
    Guid? IncidentId,
    Guid? CreatedByUserId,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public record ReportSummaryDto(
    int TotalReports,
    int AssessmentReports,
    int IncidentReports,
    int FamilyResetReports,
    DateTimeOffset? LatestGeneratedAt);

public record ReportDownloadDto(
    string? FileUrl,
    string FileName,
    string ContentType);

public record ReportQueryParams(
    string? ReportType = null,
    string? Search = null,
    DateTimeOffset? FromDate = null,
    DateTimeOffset? ToDate = null);
