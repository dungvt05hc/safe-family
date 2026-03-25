using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Reports;
using SafeFamily.Api.Features.Reports.Dtos;

namespace SafeFamily.Api.Features.Reports;

public class ReportService : IReportService
{
    private readonly AppDbContext _db;

    public ReportService(AppDbContext db)
    {
        _db = db;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ReportListItemDto>> GetReportsAsync(
        Guid userId, ReportQueryParams query, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var q = _db.Reports.Where(r => r.FamilyId == familyId);

        if (!string.IsNullOrWhiteSpace(query.ReportType) &&
            Enum.TryParse<ReportType>(query.ReportType, ignoreCase: true, out var typeFilter))
            q = q.Where(r => r.ReportType == typeFilter);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.ToLower();
            q = q.Where(r => r.Title.ToLower().Contains(term) ||
                              r.Description.ToLower().Contains(term));
        }

        if (query.FromDate.HasValue)
            q = q.Where(r => r.GeneratedAt >= query.FromDate.Value);

        if (query.ToDate.HasValue)
            q = q.Where(r => r.GeneratedAt <= query.ToDate.Value);

        var reports = await q
            .OrderByDescending(r => r.GeneratedAt)
            .ToListAsync(ct);

        return reports.Select(ToListDto).ToList();
    }

    /// <inheritdoc />
    public async Task<ReportSummaryDto> GetSummaryAsync(Guid userId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var rows = await _db.Reports
            .Where(r => r.FamilyId == familyId)
            .Select(r => new { r.ReportType, r.GeneratedAt })
            .ToListAsync(ct);

        return new ReportSummaryDto(
            TotalReports:       rows.Count,
            AssessmentReports:  rows.Count(r => r.ReportType == ReportType.Assessment),
            IncidentReports:    rows.Count(r => r.ReportType == ReportType.Incident),
            FamilyResetReports: rows.Count(r => r.ReportType == ReportType.FamilyReset),
            LatestGeneratedAt:  rows.Count > 0 ? rows.Max(r => r.GeneratedAt) : null);
    }

    /// <inheritdoc />
    public async Task<ReportDetailDto> GetByIdAsync(
        Guid userId, Guid reportId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var report = await _db.Reports
            .FirstOrDefaultAsync(r => r.Id == reportId && r.FamilyId == familyId, ct)
            ?? throw new NotFoundException("Report", reportId);

        return ToDetailDto(report);
    }

    /// <inheritdoc />
    public async Task<ReportDownloadDto> GetDownloadInfoAsync(
        Guid userId, Guid reportId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var report = await _db.Reports
            .FirstOrDefaultAsync(r => r.Id == reportId && r.FamilyId == familyId, ct)
            ?? throw new NotFoundException("Report", reportId);

        if (string.IsNullOrWhiteSpace(report.FileUrl))
            throw new AppException("This report has no associated file.", 404);

        var fileName = Path.GetFileName(report.FileUrl.Split('?')[0]);
        if (string.IsNullOrWhiteSpace(fileName))
            fileName = $"{report.Title.ToLowerInvariant().Replace(' ', '-')}.pdf";

        var contentType = ResolveContentType(fileName);

        return new ReportDownloadDto(report.FileUrl, fileName, contentType);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private async Task<Guid> RequireFamilyIdAsync(Guid userId, CancellationToken ct)
    {
        var familyId = await _db.FamilyMembers
            .Where(m => m.UserId == userId)
            .Select(m => (Guid?)m.FamilyId)
            .FirstOrDefaultAsync(ct);

        if (familyId is null)
            throw new ForbiddenException("You must be part of a family to access reports.");

        return familyId.Value;
    }

    private static string ResolveContentType(string fileName) =>
        Path.GetExtension(fileName).ToLowerInvariant() switch
        {
            ".pdf"  => "application/pdf",
            ".csv"  => "text/csv",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".json" => "application/json",
            _       => "application/octet-stream",
        };

    private static ReportListItemDto ToListDto(Report r) =>
        new(r.Id,
            r.ReportType.ToString(),
            r.Title,
            r.Description,
            r.FileUrl,
            r.GeneratedAt,
            r.BookingId,
            r.IncidentId,
            r.CreatedByUserId);

    private static ReportDetailDto ToDetailDto(Report r) =>
        new(r.Id,
            r.FamilyId,
            r.ReportType.ToString(),
            r.Title,
            r.Description,
            r.FileUrl,
            r.GeneratedAt,
            r.BookingId,
            r.IncidentId,
            r.CreatedByUserId,
            r.CreatedAt,
            r.UpdatedAt);
}
