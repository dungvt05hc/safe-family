using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Tasks;
using TaskStatus = SafeFamily.Api.Domain.Tasks.TaskStatus;

namespace SafeFamily.Api.Features.Tasks.Generation;

/// <summary>
/// Rule-based safety task generation engine.
///
/// <b>Duplicate-prevention strategy</b>:<br/>
/// Before processing any spec, the engine loads the full set of generation keys that
/// already have an active (non-superseded) task for this family into
/// <see cref="TaskGenerationContext.ExistingActiveGenerationKeys"/>.  Each spec
/// is then compared against this in-memory set — O(1) per spec — so the engine never
/// issues per-spec SELECT statements.
///
/// "Active" means <c>SupersededByTaskId IS NULL</c>.  Completed and Dismissed tasks
/// are active by this definition: if the same rule fires again later (e.g. the user
/// deleted 2FA and the system rule fires again), a new task is appropriate.  The engine
/// therefore re-creates tasks when the only existing match is Completed or Dismissed.
///
/// <b>Upsert vs supersession</b>:<br/>
/// - <see cref="GenerateAsync"/>: in-place refresh when content changes, skip when identical.
/// - <see cref="RegenerateAsync"/>: always marks old task Superseded and creates replacement.
/// </summary>
public sealed class SafetyTaskGenerationService : ISafetyTaskGenerationService
{
    private readonly AppDbContext _db;

    public SafetyTaskGenerationService(AppDbContext db) => _db = db;

    /// <inheritdoc />
    public async Task<TaskGenerationResult> GenerateAsync(
        TaskGenerationContext context,
        IEnumerable<TaskGenerationSpec> specs,
        CancellationToken ct = default)
    {
        var specList = specs.ToList();
        if (specList.Count == 0)
            return EmptyResult();

        // ── Step 1: Load existing active tasks for this family, keyed by GenerationKey.
        //
        // "Active" = SupersededByTaskId IS NULL.
        // We do a single DB query for ALL generation keys in this batch, then work
        // entirely in memory — no per-spec round-trips.
        var keys = specList
            .Select(s => s.GenerationKey)
            .Where(k => !string.IsNullOrEmpty(k))
            .ToHashSet(StringComparer.Ordinal);

        var existingByKey = await LoadExistingByKeyAsync(context.FamilyId, keys, ct);

        // Populate the context deduplication set for caller diagnostics.
        foreach (var k in existingByKey.Keys)
            context.ExistingActiveGenerationKeys.Add(k);

        // ── Step 2: Process each spec.
        var outcomes = new List<TaskGenerationOutcome>(specList.Count);

        foreach (var spec in specList)
        {
            var outcome = await UpsertAsync(spec, existingByKey, context, forceSupersede: false, ct);
            outcomes.Add(outcome);
        }

        return BuildResult(outcomes);
    }

    /// <inheritdoc />
    public async Task<TaskGenerationResult> RegenerateAsync(
        TaskGenerationContext context,
        IEnumerable<TaskGenerationSpec> specs,
        CancellationToken ct = default)
    {
        var specList = specs.ToList();
        if (specList.Count == 0)
            return EmptyResult();

        var keys = specList
            .Select(s => s.GenerationKey)
            .Where(k => !string.IsNullOrEmpty(k))
            .ToHashSet(StringComparer.Ordinal);

        var existingByKey = await LoadExistingByKeyAsync(context.FamilyId, keys, ct);

        foreach (var k in existingByKey.Keys)
            context.ExistingActiveGenerationKeys.Add(k);

        var outcomes = new List<TaskGenerationOutcome>(specList.Count);

        foreach (var spec in specList)
        {
            // forceSupersede: true — always mark old task superseded and create replacement.
            var outcome = await UpsertAsync(spec, existingByKey, context, forceSupersede: true, ct);
            outcomes.Add(outcome);
        }

        return BuildResult(outcomes);
    }

    // ── Core upsert logic ─────────────────────────────────────────────────────

    private Task<TaskGenerationOutcome> UpsertAsync(
        TaskGenerationSpec spec,
        Dictionary<string, SafetyTask> existingByKey,
        TaskGenerationContext context,
        bool forceSupersede,
        CancellationToken ct)
    {
        // Look for an active task with the same generation key.
        var existing = spec.GenerationKey is not null &&
                       existingByKey.TryGetValue(spec.GenerationKey, out var found)
            ? found
            : null;

        if (existing is null)
        {
            // ── Case 1: No active task with this key → INSERT new task.
            return Task.FromResult(CreateTask(spec, predecessorId: null, context));
        }

        // An active task exists.  "Active" includes Completed and Dismissed.
        // For those terminal statuses we create a fresh task so the family sees the rule again.
        if (existing.Status is TaskStatus.Completed or TaskStatus.Dismissed)
        {
            // The rule has fired again after family closure — treat as a re-creation.
            // Clear the key on the old task so the unique index (FamilyId, GenerationKey)
            // doesn't reject the new task with the same key.
            existing.GenerationKey = null;
            return Task.FromResult(CreateTask(spec, predecessorId: null, context));
        }

        if (forceSupersede)
        {
            // ── Case 2: Explicit regeneration → SUPERSEDE old task, INSERT replacement.
            return Task.FromResult(SupersedeAndCreate(spec, existing, context));
        }

        // ── Case 3: Active non-terminal task exists — check whether content has changed.
        if (ContentChanged(spec, existing))
        {
            // Refresh in place; no supersession, no status reset.
            RefreshTask(existing, spec, context);
            return Task.FromResult(
                new TaskGenerationOutcome(spec.GenerationKey!, TaskGenerationAction.Refreshed, existing.Id));
        }

        // ── Case 4: Task is current — nothing to do.
        return Task.FromResult(
            new TaskGenerationOutcome(spec.GenerationKey!, TaskGenerationAction.Skipped, existing.Id));
    }

    // ── Database helpers ──────────────────────────────────────────────────────

    /// <summary>
    /// Loads existing active tasks (SupersededByTaskId IS NULL) for the given family
    /// and generation keys in a single query.
    /// </summary>
    private async Task<Dictionary<string, SafetyTask>> LoadExistingByKeyAsync(
        Guid familyId, HashSet<string> keys, CancellationToken ct)
    {
        if (keys.Count == 0)
            return new Dictionary<string, SafetyTask>(StringComparer.Ordinal);

        var tasks = await _db.SafetyTasks
            .Where(t =>
                t.FamilyId == familyId &&
                t.SupersededByTaskId == null &&
                t.GenerationKey != null &&
                keys.Contains(t.GenerationKey!))
            .ToListAsync(ct);

        // If multiple active rows somehow share a key (should not happen in a healthy DB
        // but possible during data migration), prefer the most recently created one.
        return tasks
            .GroupBy(t => t.GenerationKey!, StringComparer.Ordinal)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(t => t.CreatedAt).First());
    }

    // ── Task mutation helpers ─────────────────────────────────────────────────

    /// <summary>
    /// Inserts a brand-new task from <paramref name="spec"/>.
    /// Logs a <see cref="TaskEventType.Created"/> event.
    /// </summary>
    private TaskGenerationOutcome CreateTask(
        TaskGenerationSpec spec, Guid? predecessorId, TaskGenerationContext context)
    {
        var task = new SafetyTask
        {
            FamilyId         = spec.FamilyId,
            SourceType       = spec.SourceType,
            SourceId         = spec.SourceId,
            TargetType       = spec.TargetType,
            TargetId         = spec.TargetId,
            TargetLabel      = spec.TargetLabel,
            Title            = spec.Title,
            Description      = spec.Description,
            WhyThisMatters   = spec.WhyThisMatters,
            GuidanceMarkdown = spec.GuidanceMarkdown,
            HelpLink         = spec.HelpLink,
            Category         = spec.Category,
            Priority         = spec.Priority,
            Phase            = spec.Phase,
            SortOrder        = spec.SortOrder,
            DueAt            = spec.DueAt,
            IsPremium        = spec.IsPremium,
            IsGenerated      = true,
            GenerationKey    = spec.GenerationKey,
            Status           = TaskStatus.Pending,
        };

        _db.SafetyTasks.Add(task);

        _db.TaskEvents.Add(new TaskEvent
        {
            TaskId      = task.Id,
            EventType   = TaskEventType.Created,
            Notes       = predecessorId.HasValue
                              ? $"Supersedes task {predecessorId:D}"
                              : null,
            CreatedById = context.TriggeredByUserId,
        });

        return new TaskGenerationOutcome(spec.GenerationKey!, TaskGenerationAction.Created, task.Id);
    }

    /// <summary>
    /// Marks <paramref name="existing"/> as Superseded, then inserts a replacement task.
    /// The new task's ID is stored in <c>existing.SupersededByTaskId</c> — this is the
    /// forward-link that the rest of the system uses to exclude superseded tasks from queries.
    ///
    /// A <see cref="TaskEventType.Superseded"/> event on the old task and a
    /// <see cref="TaskEventType.Created"/> event on the new task are both appended.
    /// </summary>
    private TaskGenerationOutcome SupersedeAndCreate(
        TaskGenerationSpec spec, SafetyTask existing, TaskGenerationContext context)
    {
        // Create the replacement first to get its ID.
        var outcome = CreateTask(spec, predecessorId: existing.Id, context);

        // Capture the pre-mutation status before overwriting it.
        var oldStatus = existing.Status;

        // Clear the generation key on the superseded task BEFORE SaveChangesAsync.
        // The unique index on (FamilyId, GenerationKey WHERE GenerationKey IS NOT NULL)
        // would otherwise reject the new task that carries the same key.
        // The key is preserved in the TaskEvent notes for audit purposes.
        existing.GenerationKey      = null;
        existing.Status             = TaskStatus.Superseded;
        existing.SupersededByTaskId = outcome.TaskId;
        existing.UpdatedAt          = DateTimeOffset.UtcNow;

        _db.TaskEvents.Add(new TaskEvent
        {
            TaskId      = existing.Id,
            EventType   = TaskEventType.Superseded,
            OldStatus   = oldStatus,
            NewStatus   = TaskStatus.Superseded,
            Notes       = $"Superseded by task {outcome.TaskId:D}",
            CreatedById = context.TriggeredByUserId,
        });

        // Return a Superseded outcome so the caller knows both old and new IDs can be inferred.
        return new TaskGenerationOutcome(spec.GenerationKey!, TaskGenerationAction.Superseded, outcome.TaskId);
    }

    /// <summary>
    /// Updates the mutable content fields of <paramref name="task"/> from <paramref name="spec"/>
    /// and appends a <see cref="TaskEventType.Updated"/> event.
    ///
    /// Status, CompletedAt, SkippedAt, FamilyId, and Id are intentionally NOT touched.
    /// </summary>
    private void RefreshTask(SafetyTask task, TaskGenerationSpec spec, TaskGenerationContext context)
    {
        task.Title            = spec.Title;
        task.Description      = spec.Description;
        task.WhyThisMatters   = spec.WhyThisMatters;
        task.GuidanceMarkdown = spec.GuidanceMarkdown;
        task.HelpLink         = spec.HelpLink;
        task.Category         = spec.Category;
        task.Priority         = spec.Priority;
        task.Phase            = spec.Phase;
        task.SortOrder        = spec.SortOrder;
        task.DueAt            = spec.DueAt;
        task.IsPremium        = spec.IsPremium;
        task.TargetLabel      = spec.TargetLabel;
        task.UpdatedAt        = DateTimeOffset.UtcNow;

        _db.TaskEvents.Add(new TaskEvent
        {
            TaskId      = task.Id,
            EventType   = TaskEventType.Updated,
            Notes       = "Task refreshed by generation engine.",
            CreatedById = context.TriggeredByUserId,
        });
    }

    // ── Change detection ──────────────────────────────────────────────────────

    /// <summary>
    /// Returns true if any content or metadata field in <paramref name="spec"/>
    /// differs from the persisted <paramref name="task"/>.
    ///
    /// Status, timestamps, and FamilyId are deliberately excluded from this comparison —
    /// they are managed separately and should not trigger a refresh.
    /// </summary>
    private static bool ContentChanged(TaskGenerationSpec spec, SafetyTask task) =>
        task.Title            != spec.Title            ||
        task.Description      != spec.Description      ||
        task.WhyThisMatters   != spec.WhyThisMatters   ||
        task.GuidanceMarkdown != spec.GuidanceMarkdown ||
        task.HelpLink         != spec.HelpLink         ||
        task.Category         != spec.Category         ||
        task.Priority         != spec.Priority         ||
        task.Phase            != spec.Phase            ||
        task.SortOrder        != spec.SortOrder        ||
        task.DueAt            != spec.DueAt            ||
        task.IsPremium        != spec.IsPremium        ||
        task.TargetLabel      != spec.TargetLabel;

    // ── Result helpers ────────────────────────────────────────────────────────

    private static TaskGenerationResult BuildResult(List<TaskGenerationOutcome> outcomes) =>
        new()
        {
            CreatedCount    = outcomes.Count(o => o.Action == TaskGenerationAction.Created),
            RefreshedCount  = outcomes.Count(o => o.Action == TaskGenerationAction.Refreshed),
            SkippedCount    = outcomes.Count(o => o.Action == TaskGenerationAction.Skipped),
            SupersededCount = outcomes.Count(o => o.Action == TaskGenerationAction.Superseded),
            Outcomes        = outcomes,
        };

    private static TaskGenerationResult EmptyResult() =>
        new() { Outcomes = [] };
}
