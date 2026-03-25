using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SafeFamily.Api.Features.Reports.Dtos;

namespace SafeFamily.Api.Features.Reports;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    // GET /api/reports?reportType=Assessment&search=...&fromDate=...&toDate=...
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ReportListItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetReports(
        [FromQuery] string? reportType,
        [FromQuery] string? search,
        [FromQuery] DateTimeOffset? fromDate,
        [FromQuery] DateTimeOffset? toDate,
        CancellationToken ct)
    {
        var query = new ReportQueryParams(reportType, search, fromDate, toDate);
        var reports = await _reportService.GetReportsAsync(GetUserId(), query, ct);
        return Ok(reports);
    }

    // GET /api/reports/summary
    [HttpGet("summary")]
    [ProducesResponseType(typeof(ReportSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetSummary(CancellationToken ct)
    {
        var summary = await _reportService.GetSummaryAsync(GetUserId(), ct);
        return Ok(summary);
    }

    // GET /api/reports/{id}
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ReportDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var report = await _reportService.GetByIdAsync(GetUserId(), id, ct);
        return Ok(report);
    }

    // GET /api/reports/{id}/download
    [HttpGet("{id:guid}/download")]
    [ProducesResponseType(typeof(ReportDownloadDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDownload(Guid id, CancellationToken ct)
    {
        var download = await _reportService.GetDownloadInfoAsync(GetUserId(), id, ct);
        return Ok(download);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
