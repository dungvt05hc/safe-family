using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Checklists;
using SafeFamily.Api.Features.Checklists.Dtos;

namespace SafeFamily.Api.Features.Checklists;

public class ChecklistService : IChecklistService
{
    private readonly AppDbContext _db;
    private readonly ChecklistGenerationService _generator;

    public ChecklistService(AppDbContext db, ChecklistGenerationService generator)
    {
        _db = db;
        _generator = generator;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ChecklistItemDto>> GetChecklistAsync(
        Guid userId, ChecklistQueryParams query, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        await ReconcileAsync(familyId, ct);

        var q = _db.ChecklistItems.Where(i => i.FamilyId == familyId);

        if (!string.IsNullOrWhiteSpace(query.Severity))
        {
            var priority = ParsePriority(query.Severity);
            if (priority.HasValue)
                q = q.Where(i => i.Priority == priority.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Status) && TryParseStatus(query.Status, out var statusFilter))
            q = q.Where(i => i.Status == statusFilter);

        if (!string.IsNullOrWhiteSpace(query.Category) &&
            Enum.TryParse<ChecklistCategory>(query.Category, ignoreCase: true, out var categoryFilter))
            q = q.Where(i => i.Category == categoryFilter);

        if (!string.IsNullOrWhiteSpace(query.Search))
            q = q.Where(i => i.Title.ToLower().Contains(query.Search.ToLower()));

        var result = await q
            .OrderBy(i => i.Priority)
            .ThenBy(i => i.DueAt.HasValue ? 0 : 1)
            .ThenBy(i => i.DueAt)
            .ThenByDescending(i => i.CreatedAt)
            .ToListAsync(ct);

        return result.Select(ToDto).ToList();
    }

    /// <inheritdoc />
    public async Task<ChecklistSummaryDto> GetSummaryAsync(Guid userId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        await ReconcileAsync(familyId, ct);

        var items = await _db.ChecklistItems
            .Where(i => i.FamilyId == familyId)
            .Select(i => new { i.Priority, i.Status })
            .ToListAsync(ct);

        return new ChecklistSummaryDto(
            TotalTasks:       items.Count,
            HighPriorityTasks: items.Count(i => i.Priority == 1),
            InProgressTasks:  items.Count(i => i.Status == ChecklistItemStatus.InProgress),
            CompletedTasks:   items.Count(i => i.Status == ChecklistItemStatus.Completed));
    }

    /// <inheritdoc />
    public async Task<ChecklistItemDto> UpdateStatusAsync(
        Guid userId, Guid itemId, UpdateChecklistStatusRequest request,
        CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var item = await _db.ChecklistItems
            .FirstOrDefaultAsync(i => i.Id == itemId && i.FamilyId == familyId, ct)
            ?? throw new NotFoundException("ChecklistItem", itemId);

        if (!TryParseStatus(request.Status, out var newStatus))
            throw new ConflictException($"Invalid status value: '{request.Status}'.");

        item.Status = newStatus;
        await _db.SaveChangesAsync(ct);

        return ToDto(item);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task ReconcileAsync(Guid familyId, CancellationToken ct)
    {
        var accounts = await _db.Accounts
            .Where(a => a.FamilyId == familyId)
            .ToListAsync(ct);

        var devices = await _db.Devices
            .Where(d => d.FamilyId == familyId)
            .ToListAsync(ct);

        var generated = _generator.Generate(accounts, devices);
        var generatedBySourceId = generated.ToDictionary(g => g.SourceId);

        var existingItems = await _db.ChecklistItems
            .Where(i => i.FamilyId == familyId)
            .ToListAsync(ct);

        var existingBySourceId = existingItems
            .Where(i => i.SourceId != null)
            .ToDictionary(i => i.SourceId!);

        // Remove Pending items whose conditions are now resolved
        var toRemove = existingItems
            .Where(i => i.Status == ChecklistItemStatus.Pending
                     && i.SourceId != null
                     && !generatedBySourceId.ContainsKey(i.SourceId))
            .ToList();
        _db.ChecklistItems.RemoveRange(toRemove);

        // Add newly detected items that don't exist yet
        foreach (var gen in generated)
        {
            if (!existingBySourceId.ContainsKey(gen.SourceId))
            {
                _db.ChecklistItems.Add(new ChecklistItem
                {
                    FamilyId    = familyId,
                    Title       = gen.Title,
                    Description = gen.Description,
                    Category    = gen.Category,
                    Status      = ChecklistItemStatus.Pending,
                    Priority    = gen.Priority,
                    SourceType  = gen.SourceType,
                    SourceId    = gen.SourceId,
                });
            }
        }

        await _db.SaveChangesAsync(ct);
    }

    private async Task<Guid> RequireFamilyIdAsync(Guid userId, CancellationToken ct)
    {
        var familyId = await _db.FamilyMembers
            .Where(m => m.UserId == userId)
            .Select(m => (Guid?)m.FamilyId)
            .FirstOrDefaultAsync(ct);

        if (familyId is null)
            throw new ForbiddenException("You must be part of a family to access checklists.");

        return familyId.Value;
    }

    private static bool TryParseStatus(string value, out ChecklistItemStatus status)
    {
        status = value.ToLowerInvariant() switch
        {
            "todo" or "pending"            => ChecklistItemStatus.Pending,
            "in_progress" or "inprogress"  => ChecklistItemStatus.InProgress,
            "done" or "completed"           => ChecklistItemStatus.Completed,
            "skipped" or "dismissed"        => ChecklistItemStatus.Dismissed,
            _ => (ChecklistItemStatus)(-1),
        };
        if ((int)status != -1) return true;
        return Enum.TryParse(value, ignoreCase: true, out status);
    }

    private static int? ParsePriority(string value) =>
        value.ToLowerInvariant() switch
        {
            "high"   or "1" => 1,
            "medium" or "med" or "2" => 2,
            "low"    or "3" => 3,
            _ => null,
        };

    private static ChecklistItemDto ToDto(ChecklistItem item) =>
        new(item.Id,
            item.Title,
            item.Description,
            item.Category.ToString(),
            item.Status.ToString(),
            item.Priority,
            item.SourceType.ToString(),
            item.SourceId,
            item.DueAt,
            item.HelpUrl);
}
