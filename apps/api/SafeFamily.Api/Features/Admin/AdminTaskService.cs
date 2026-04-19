using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Tasks;
using SafeFamily.Api.Features.Admin.Dtos;
using SafeFamily.Api.Features.Tasks;
using SafeFamily.Api.Features.Tasks.Generation;
using TaskStatus = SafeFamily.Api.Domain.Tasks.TaskStatus;

namespace SafeFamily.Api.Features.Admin;

/// <summary>
/// Implements <see cref="IAdminTaskService"/> — admin/debug operations for
/// safety task generation inspection and manual re-triggering.
/// </summary>
public sealed class AdminTaskService : IAdminTaskService
{
    private readonly AppDbContext _db;
    private readonly ISafetyTaskLifecycleService _lifecycle;
    private readonly ILogger<AdminTaskService> _logger;

    public AdminTaskService(
        AppDbContext db,
        ISafetyTaskLifecycleService lifecycle,
        ILogger<AdminTaskService> logger)
    {
        _db        = db;
        _lifecycle = lifecycle;
        _logger    = logger;
    }

    // ── GetFamilyTaskSummaryAsync ─────────────────────────────────────────────

    /// <inheritdoc />
    public async Task<AdminFamilyTaskSummaryDto> GetFamilyTaskSummaryAsync(
        Guid familyId, CancellationToken ct = default)
    {
        await RequireFamilyAsync(familyId, ct);

        var tasks = await _db.SafetyTasks
            .Where(t => t.FamilyId == familyId)
            .Select(t => new
            {
                t.SourceType,
                t.Status,
                t.IsGenerated,
                t.CreatedAt,
            })
            .ToListAsync(ct);

        int total      = tasks.Count;
        int pending    = tasks.Count(t => t.Status == TaskStatus.Pending);
        int inProgress = tasks.Count(t => t.Status == TaskStatus.InProgress);
        int completed  = tasks.Count(t => t.Status == TaskStatus.Completed);
        int dismissed  = tasks.Count(t => t.Status == TaskStatus.Dismissed);
        int superseded = tasks.Count(t => t.Status == TaskStatus.Superseded);
        int generated  = tasks.Count(t => t.IsGenerated);
        int manual     = tasks.Count(t => !t.IsGenerated);

        DateTimeOffset? lastGeneratedAt = tasks
            .Where(t => t.IsGenerated)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => (DateTimeOffset?)t.CreatedAt)
            .FirstOrDefault();

        // Per-source breakdown
        var bySource = tasks
            .GroupBy(t => t.SourceType.ToString())
            .Select(g => new AdminTaskSourceBreakdownRow(
                SourceType: g.Key,
                Total:      g.Count(),
                Completed:  g.Count(t => t.Status == TaskStatus.Completed),
                Pending:    g.Count(t => t.Status == TaskStatus.Pending || t.Status == TaskStatus.InProgress)))
            .OrderBy(r => r.SourceType)
            .ToList();

        return new AdminFamilyTaskSummaryDto(
            FamilyId:        familyId,
            Total:           total,
            Pending:         pending,
            InProgress:      inProgress,
            Completed:       completed,
            Dismissed:       dismissed,
            Superseded:      superseded,
            Generated:       generated,
            Manual:          manual,
            LastGeneratedAt: lastGeneratedAt,
            BySourceType:    bySource);
    }

    // ── GetGenerationLogAsync ─────────────────────────────────────────────────

    /// <inheritdoc />
    public async Task<AdminTaskGenerationLogDto> GetGenerationLogAsync(
        Guid familyId, CancellationToken ct = default)
    {
        await RequireFamilyAsync(familyId, ct);

        // Load tasks with their event log, newest task first.
        var tasks = await _db.SafetyTasks
            .Where(t => t.FamilyId == familyId)
            .Include(t => t.Events.OrderBy(e => e.CreatedAt))
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(ct);

        var entries = tasks.Select(t => new AdminTaskLogEntry(
            Id:                t.Id,
            SourceType:        t.SourceType.ToString(),
            SourceId:          t.SourceId,
            GenerationKey:     t.GenerationKey,
            BookingId:         ExtractBookingId(t.GenerationKey),
            Title:             t.Title,
            Phase:             t.Phase.ToString(),
            Priority:          t.Priority.ToString(),
            Status:            t.Status.ToString(),
            IsGenerated:       t.IsGenerated,
            SupersededByTaskId: t.SupersededByTaskId,
            CreatedAt:         t.CreatedAt,
            UpdatedAt:         t.UpdatedAt,
            Events:            t.Events.Select(e => new AdminTaskEventDto(
                Id:          e.Id,
                EventType:   e.EventType.ToString(),
                OldStatus:   e.OldStatus?.ToString(),
                NewStatus:   e.NewStatus?.ToString(),
                Notes:       e.Notes,
                CreatedById: e.CreatedById,
                CreatedAt:   e.CreatedAt)).ToList()
        )).ToList();

        return new AdminTaskGenerationLogDto(
            FamilyId:   familyId,
            AsAt:       DateTimeOffset.UtcNow,
            TotalTasks: entries.Count,
            Tasks:      entries);
    }

    // ── TriggerRegenerationAsync ──────────────────────────────────────────────

    /// <inheritdoc />
    public async Task<AdminTaskGenerationResultDto> TriggerRegenerationAsync(
        Guid familyId, Guid adminId, CancellationToken ct = default)
    {
        await RequireFamilyAsync(familyId, ct);

        // Find the family's most recent completed assessment.
        var assessment = await _db.Assessments
            .Where(a => a.FamilyId == familyId)
            .OrderByDescending(a => a.CreatedAt)
            .FirstOrDefaultAsync(ct);

        if (assessment is null)
        {
            _logger.LogInformation(
                "AdminTaskService: family {FamilyId} has no assessment — regeneration skipped.",
                familyId);

            return new AdminTaskGenerationResultDto(
                FamilyId:    familyId,
                AssessmentId: null,
                Created:     0,
                Refreshed:   0,
                Skipped:     0,
                Superseded:  0,
                WasNoOp:     true,
                Message:     "No assessment found for this family. Complete an assessment before regenerating tasks.",
                TriggeredAt: DateTimeOffset.UtcNow,
                Outcomes:    []);
        }

        _logger.LogInformation(
            "AdminTaskService: triggering regeneration for family {FamilyId} using assessment {AssessmentId}, triggered by admin {AdminId}.",
            familyId, assessment.Id, adminId);

        var result = await _lifecycle.RegenerateForAssessmentAsync(
            familyId, assessment.Id, adminId, ct);

        var outcomes = result.Outcomes
            .Select(o => new AdminTaskOutcomeDto(
                GenerationKey: o.GenerationKey,
                Action:        o.Action.ToString(),
                TaskId:        o.TaskId))
            .ToList();

        var message = result.WasNoOp
            ? "Regeneration complete — all tasks were already up to date."
            : $"Regeneration complete — {result.CreatedCount} created, {result.RefreshedCount} refreshed, {result.SupersededCount} superseded, {result.SkippedCount} skipped.";

        return new AdminTaskGenerationResultDto(
            FamilyId:    familyId,
            AssessmentId: assessment.Id,
            Created:     result.CreatedCount,
            Refreshed:   result.RefreshedCount,
            Skipped:     result.SkippedCount,
            Superseded:  result.SupersededCount,
            WasNoOp:     result.WasNoOp,
            Message:     message,
            TriggeredAt: DateTimeOffset.UtcNow,
            Outcomes:    outcomes);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task RequireFamilyAsync(Guid familyId, CancellationToken ct)
    {
        var exists = await _db.Families.AnyAsync(f => f.Id == familyId, ct);
        if (!exists)
            throw new NotFoundException("Family", familyId);
    }

    /// <summary>
    /// Extracts the BookingId embedded in a booking-position generation key.
    /// Keys follow the pattern: task:booking:{slug}:{bookingId}:{n}
    /// Returns null for entity-keyed tasks (acc-*, dev-*) or manual tasks.
    /// </summary>
    private static Guid? ExtractBookingId(string? generationKey)
    {
        if (generationKey is null)
            return null;

        // e.g. "task:booking:family-plan:3fa85f64-...:1"
        var parts = generationKey.Split(':');
        if (parts.Length >= 4 && Guid.TryParse(parts[3], out var id))
            return id;

        return null;
    }
}
