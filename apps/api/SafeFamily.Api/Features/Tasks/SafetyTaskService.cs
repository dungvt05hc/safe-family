using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Entitlements;
using SafeFamily.Api.Domain.Tasks;
using SafeFamily.Api.Features.Tasks.Dtos;
using TaskStatus = SafeFamily.Api.Domain.Tasks.TaskStatus;

namespace SafeFamily.Api.Features.Tasks;

public class SafetyTaskService : ISafetyTaskService
{
    private readonly AppDbContext _db;

    public SafetyTaskService(AppDbContext db)
    {
        _db = db;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<SafetyTaskDto>> GetTasksAsync(
        Guid userId, SafetyTaskQueryParams query, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        // Load all active entitlements for this family in a single query so every
        // subsequent access decision is O(1) — no per-task DB round-trips.
        var ents = await LoadFamilyEntitlementsAsync(familyId, ct);
        var hasFamilyPlan   = ents.Contains(EntitlementType.FamilySafetyPlanAccess);
        var hasIncidentPack = ents.Contains(EntitlementType.IncidentRecoveryPackAccess);
        var hasAnnualPlan   = ents.Contains(EntitlementType.AnnualPlanSubscription);
        var hasPremiumTasks = ents.Contains(EntitlementType.PremiumTasksAccess);

        // Base query: only this family's non-superseded tasks, filtered by entitlements.
        var q = _db.SafetyTasks
            .Where(t => t.FamilyId == familyId && t.SupersededByTaskId == null);

        q = ApplyAccessFilter(q, hasFamilyPlan, hasIncidentPack, hasAnnualPlan, hasPremiumTasks);

        if (!string.IsNullOrWhiteSpace(query.Status) &&
            TryParseStatus(query.Status, out var statusFilter))
            q = q.Where(t => t.Status == statusFilter);
        else
            q = q.Where(t => t.Status != TaskStatus.Dismissed);

        if (!string.IsNullOrWhiteSpace(query.Priority) &&
            TryParsePriority(query.Priority, out var priorityFilter))
            q = q.Where(t => t.Priority == priorityFilter);

        if (!string.IsNullOrWhiteSpace(query.Phase) &&
            Enum.TryParse<TaskPhase>(query.Phase, ignoreCase: true, out var phaseFilter))
            q = q.Where(t => t.Phase == phaseFilter);

        if (!string.IsNullOrWhiteSpace(query.Category) &&
            Enum.TryParse<TaskCategory>(query.Category, ignoreCase: true, out var categoryFilter))
            q = q.Where(t => t.Category == categoryFilter);

        if (!string.IsNullOrWhiteSpace(query.SourceType) &&
            Enum.TryParse<TaskSourceType>(query.SourceType, ignoreCase: true, out var sourceFilter))
            q = q.Where(t => t.SourceType == sourceFilter);

        if (!string.IsNullOrWhiteSpace(query.TargetType) &&
            Enum.TryParse<TaskTargetType>(query.TargetType, ignoreCase: true, out var targetTypeFilter))
            q = q.Where(t => t.TargetType == targetTypeFilter);

        if (query.TargetId.HasValue)
            q = q.Where(t => t.TargetId == query.TargetId.Value);

        if (!string.IsNullOrWhiteSpace(query.Search))
            q = q.Where(t => t.Title.ToLower().Contains(query.Search.ToLower()));

        var tasks = await q
            .OrderBy(t => t.SortOrder)
            .ThenBy(t => (int)t.Priority)
            .ThenBy(t => (int)t.Phase)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync(ct);

        return tasks.Select(ToDto).ToList();
    }

    /// <inheritdoc />
    public async Task<SafetyTaskSummaryDto> GetSummaryAsync(Guid userId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        // Summary is scoped to only the tasks the family can actually access,
        // so counts reflect actionable work rather than locked premium content.
        var ents = await LoadFamilyEntitlementsAsync(familyId, ct);
        var hasFamilyPlan   = ents.Contains(EntitlementType.FamilySafetyPlanAccess);
        var hasIncidentPack = ents.Contains(EntitlementType.IncidentRecoveryPackAccess);
        var hasAnnualPlan   = ents.Contains(EntitlementType.AnnualPlanSubscription);
        var hasPremiumTasks = ents.Contains(EntitlementType.PremiumTasksAccess);

        var baseQ = _db.SafetyTasks
            .Where(t => t.FamilyId == familyId && t.SupersededByTaskId == null);
        baseQ = ApplyAccessFilter(baseQ, hasFamilyPlan, hasIncidentPack, hasAnnualPlan, hasPremiumTasks);

        var counts = await baseQ
            .Select(t => new { t.Priority, t.Status, t.Phase })
            .ToListAsync(ct);

        var remaining = counts
            .Where(t => t.Status != TaskStatus.Completed && t.Status != TaskStatus.Dismissed)
            .ToList();

        return new SafetyTaskSummaryDto(
            TotalTasks:        counts.Count,
            CompletedTasks:    counts.Count(t => t.Status == TaskStatus.Completed),
            CriticalRemaining: remaining.Count(t => t.Phase == TaskPhase.Immediate),
            HighRemaining:     remaining.Count(t => t.Priority == TaskPriority.High),
            TasksInProgress:   counts.Count(t => t.Status == TaskStatus.InProgress));
    }

    /// <inheritdoc />
    public async Task<SafetyTaskDto> UpdateStatusAsync(
        Guid userId, Guid taskId, UpdateSafetyTaskStatusRequest request,
        CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var task = await _db.SafetyTasks
            .FirstOrDefaultAsync(t => t.Id == taskId && t.FamilyId == familyId
                                   && t.SupersededByTaskId == null, ct)
            ?? throw new NotFoundException("SafetyTask", taskId);

        // Entitlement gate: prevent free users from updating premium tasks.
        // Guards against clients that bypass the list filter by issuing a direct
        // PATCH to a known task ID — a task the family cannot read is also one
        // they cannot mutate.
        var ents = await LoadFamilyEntitlementsAsync(familyId, ct);
        ThrowIfAccessDenied(task, ents);

        if (!TryParseStatus(request.Status, out var newStatus))
            throw new ConflictException($"Invalid status value: '{request.Status}'.");

        // Guard: superseded tasks are archived records and cannot be mutated.
        // Guard: enforce allowed transitions — reject no-ops and illegal moves.
        if (!IsValidTransition(task.Status, newStatus))
            throw new ConflictException(
                $"Cannot transition task from '{task.Status}' to '{newStatus}'.");

        var oldStatus = task.Status;
        task.Status = newStatus;

        if (newStatus == TaskStatus.Completed)
            task.CompletedAt = DateTimeOffset.UtcNow;
        else if (newStatus == TaskStatus.Dismissed)
            task.SkippedAt = DateTimeOffset.UtcNow;

        _db.TaskEvents.Add(new TaskEvent
        {
            TaskId      = task.Id,
            EventType   = TaskEventType.StatusChanged,
            OldStatus   = oldStatus,
            NewStatus   = newStatus,
            Notes       = request.Notes,
            CreatedById = userId,
        });

        await _db.SaveChangesAsync(ct);

        return ToDto(task);
    }

    /// <inheritdoc />
    public async Task<SafetyTaskDto?> GetTaskByIdAsync(
        Guid userId, Guid taskId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var task = await _db.SafetyTasks
            .FirstOrDefaultAsync(t => t.Id == taskId && t.FamilyId == familyId
                                   && t.SupersededByTaskId == null, ct);

        // Ownership check: 404 when the task doesn't exist or belongs to another family.
        // Also 404 for superseded tasks — they are archived records, not surfaced to clients.
        if (task is null) return null;

        // Entitlement check: 402 when the task exists but is locked behind a product.
        // Using 402 (not 403) allows clients to distinguish "not found" from "locked"
        // and surface an appropriate upgrade prompt to the user.
        var ents = await LoadFamilyEntitlementsAsync(familyId, ct);
        ThrowIfAccessDenied(task, ents);

        return ToDto(task);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<Guid> RequireFamilyIdAsync(Guid userId, CancellationToken ct)
    {
        var familyId = await _db.FamilyMembers
            .Where(m => m.UserId == userId)
            .Select(m => (Guid?)m.FamilyId)
            .FirstOrDefaultAsync(ct);

        if (familyId is null)
            throw new ForbiddenException("You must be part of a family to access safety tasks.");

        return familyId.Value;
    }

    private static bool TryParseStatus(string value, out TaskStatus status)
    {
        status = value.ToLowerInvariant() switch
        {
            "todo" or "pending"           => TaskStatus.Pending,
            "in_progress" or "inprogress" => TaskStatus.InProgress,
            "done" or "completed"          => TaskStatus.Completed,
            "skipped" or "dismissed"       => TaskStatus.Dismissed,
            _ => (TaskStatus)(-1),
        };
        if ((int)status != -1) return true;
        return Enum.TryParse(value, ignoreCase: true, out status);
    }

    /// <summary>
    /// Enforces the task status state machine.
    ///
    /// Allowed transitions (mirrors what the client UI exposes):
    ///   Pending    → InProgress, Completed, Dismissed
    ///   InProgress → Completed, Dismissed, Pending  (re-open as Pending)
    ///   Completed  → Pending                        (re-open)
    ///   Dismissed  → Pending                        (re-open)
    ///   Superseded → (none — archived, not mutable by clients)
    ///
    /// Same-status transitions are rejected as no-ops to prevent spurious TaskEvents.
    /// </summary>
    internal static bool IsValidTransition(TaskStatus from, TaskStatus to) =>
        (from, to) switch
        {
            (TaskStatus.Pending,    TaskStatus.InProgress) => true,
            (TaskStatus.Pending,    TaskStatus.Completed)  => true,
            (TaskStatus.Pending,    TaskStatus.Dismissed)  => true,
            (TaskStatus.InProgress, TaskStatus.Completed)  => true,
            (TaskStatus.InProgress, TaskStatus.Dismissed)  => true,
            (TaskStatus.InProgress, TaskStatus.Pending)    => true,
            (TaskStatus.Completed,  TaskStatus.Pending)    => true,
            (TaskStatus.Dismissed,  TaskStatus.Pending)    => true,
            _ => false,
        };

    private static bool TryParsePriority(string value, out TaskPriority priority)
    {
        priority = value.ToLowerInvariant() switch
        {
            "high"   or "1" => TaskPriority.High,
            "medium" or "med" or "2" => TaskPriority.Medium,
            "low"    or "3" => TaskPriority.Low,
            _ => (TaskPriority)(-1),
        };
        if ((int)priority != -1) return true;
        return Enum.TryParse(value, ignoreCase: true, out priority);
    }

    // ── Premium access helpers ────────────────────────────────────────────────

    /// <summary>
    /// Loads all active entitlement types for a family in a single query.
    /// Callers can check multiple entitlements with O(1) HashSet lookups,
    /// avoiding N+1 DB round-trips per entitlement type.
    /// </summary>
    private async Task<HashSet<EntitlementType>> LoadFamilyEntitlementsAsync(
        Guid familyId, CancellationToken ct)
    {
        var now   = DateTimeOffset.UtcNow;
        var types = await _db.Entitlements
            .Where(e => e.FamilyId == familyId
                     && e.IsActive
                     && e.StartsAt <= now
                     && (e.ExpiresAt == null || e.ExpiresAt > now))
            .Select(e => e.EntitlementType)
            .Distinct()
            .ToListAsync(ct);
        return new HashSet<EntitlementType>(types);
    }

    /// <summary>
    /// Applies an EF Core-compatible WHERE predicate that enforces product-level
    /// and premium-flag entitlement gating on a <see cref="SafetyTask"/> query.
    ///
    /// Access rules (source type → required entitlement):
    /// <list type="bullet">
    ///   <item><c>FamilySafetyPlan</c>     → <see cref="EntitlementType.FamilySafetyPlanAccess"/></item>
    ///   <item><c>IncidentRecoveryPack</c>  → <see cref="EntitlementType.IncidentRecoveryPackAccess"/></item>
    ///   <item><c>AnnualPlan</c>            → <see cref="EntitlementType.AnnualPlanSubscription"/></item>
    ///   <item>Any other source with <c>IsPremium=true</c> → <see cref="EntitlementType.PremiumTasksAccess"/>
    ///         (or any product entitlement above, since paid package holders are always premium)</item>
    /// </list>
    /// Free tasks (<c>IsPremium=false</c>) from any source are always accessible.
    /// </summary>
    private static IQueryable<SafetyTask> ApplyAccessFilter(
        IQueryable<SafetyTask> q,
        bool hasFamilyPlan,
        bool hasIncidentPack,
        bool hasAnnualPlan,
        bool hasPremiumTasks)
    {
        return q.Where(t =>
            // ── Product source gate ────────────────────────────────────────────
            // Tasks generated by a premium package are only accessible when the
            // family holds the corresponding product entitlement.
            (t.SourceType != TaskSourceType.FamilySafetyPlan     || hasFamilyPlan)  &&
            (t.SourceType != TaskSourceType.IncidentRecoveryPack || hasIncidentPack) &&
            (t.SourceType != TaskSourceType.AnnualPlan           || hasAnnualPlan)   &&
            // ── IsPremium flag gate ─────────────────────────────────────────────
            // Tasks explicitly marked premium (AccountRule / DeviceRule / Manual
            // sources) require broad PremiumTasksAccess, unless the family holds
            // any product entitlement (product subscribers always get premium tasks).
            (!t.IsPremium
              || hasPremiumTasks
              || (t.SourceType == TaskSourceType.FamilySafetyPlan     && hasFamilyPlan)
              || (t.SourceType == TaskSourceType.IncidentRecoveryPack && hasIncidentPack)
              || (t.SourceType == TaskSourceType.AnnualPlan           && hasAnnualPlan))
        );
    }

    /// <summary>
    /// Returns true when the family's active entitlements grant access to <paramref name="task"/>.
    /// Used for single-task access decisions after the task is already loaded from the DB.
    /// </summary>
    private static bool CanAccessTask(SafetyTask task, HashSet<EntitlementType> ents)
    {
        // Product source gate
        if (task.SourceType == TaskSourceType.FamilySafetyPlan
            && !ents.Contains(EntitlementType.FamilySafetyPlanAccess))
            return false;

        if (task.SourceType == TaskSourceType.IncidentRecoveryPack
            && !ents.Contains(EntitlementType.IncidentRecoveryPackAccess))
            return false;

        if (task.SourceType == TaskSourceType.AnnualPlan
            && !ents.Contains(EntitlementType.AnnualPlanSubscription))
            return false;

        // IsPremium flag gate — broad premium access OR any active product entitlement
        if (task.IsPremium
            && !ents.Contains(EntitlementType.PremiumTasksAccess)
            && !ents.Contains(EntitlementType.FamilySafetyPlanAccess)
            && !ents.Contains(EntitlementType.IncidentRecoveryPackAccess)
            && !ents.Contains(EntitlementType.AnnualPlanSubscription))
            return false;

        return true;
    }

    /// <summary>
    /// Throws <see cref="EntitlementRequiredException"/> (HTTP 402) when the family
    /// cannot access <paramref name="task"/>. Resolves the most specific product name
    /// and entitlement key from the task's source type so the client receives
    /// actionable upgrade information in the error payload.
    /// </summary>
    private static void ThrowIfAccessDenied(SafetyTask task, HashSet<EntitlementType> ents)
    {
        if (CanAccessTask(task, ents)) return;

        var (productName, requiredEntitlement) = task.SourceType switch
        {
            TaskSourceType.FamilySafetyPlan =>
                ("Family Safety Plan", nameof(EntitlementType.FamilySafetyPlanAccess)),
            TaskSourceType.IncidentRecoveryPack =>
                ("Incident Recovery Pack", nameof(EntitlementType.IncidentRecoveryPackAccess)),
            TaskSourceType.AnnualPlan =>
                ("Annual Safety Plan", nameof(EntitlementType.AnnualPlanSubscription)),
            _ =>
                ("Premium Safety Tasks", nameof(EntitlementType.PremiumTasksAccess)),
        };

        throw new EntitlementRequiredException(productName, requiredEntitlement);
    }

    private static SafetyTaskDto ToDto(SafetyTask t) => new(
        t.Id,
        t.FamilyId,
        t.SourceType.ToString(),
        t.SourceId,
        t.TargetType.ToString(),
        t.TargetId,
        t.TargetLabel,
        t.Title,
        t.Description,
        t.WhyThisMatters,
        t.GuidanceMarkdown,
        t.HelpLink,
        t.Category.ToString(),
        t.Priority.ToString(),
        t.Phase.ToString(),
        t.Status.ToString(),
        t.SortOrder,
        t.DueAt,
        t.IsPremium,
        t.IsGenerated,
        t.GenerationKey,
        t.SupersededByTaskId,
        t.CompletedAt,
        t.SkippedAt,
        t.CreatedAt,
        t.UpdatedAt);
}
