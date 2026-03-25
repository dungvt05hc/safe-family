using SafeFamily.Api.Features.Reports.Dtos;

namespace SafeFamily.Api.Features.Reports;

public interface IReportService
{
    /// <summary>Returns all reports for the user's family, with optional filtering.</summary>
    Task<IReadOnlyList<ReportListItemDto>> GetReportsAsync(
        Guid userId, ReportQueryParams query, CancellationToken ct = default);

    /// <summary>Returns aggregate counts and latest generation timestamp.</summary>
    Task<ReportSummaryDto> GetSummaryAsync(Guid userId, CancellationToken ct = default);

    /// <summary>Returns full detail for a single report scoped to the user's family.</summary>
    Task<ReportDetailDto> GetByIdAsync(Guid userId, Guid reportId, CancellationToken ct = default);

    /// <summary>Returns download metadata (URL, filename, content type) for a report file.</summary>
    Task<ReportDownloadDto> GetDownloadInfoAsync(Guid userId, Guid reportId, CancellationToken ct = default);
}
