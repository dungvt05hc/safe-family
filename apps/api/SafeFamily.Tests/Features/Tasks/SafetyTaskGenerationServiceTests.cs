using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Tasks;
using SafeFamily.Api.Features.Tasks.Generation;
using Xunit;
using TaskStatus = SafeFamily.Api.Domain.Tasks.TaskStatus;

namespace SafeFamily.Tests.Features.Tasks;

/// <summary>
/// Integration-style tests for SafetyTaskGenerationService using an EF Core InMemory database.
/// Covers: new-task creation, duplicate-key skipping, in-place refresh, supersession (C1 fix),
/// and re-creation after Completed/Dismissed (C2 fix).
/// </summary>
public class SafetyTaskGenerationServiceTests : IDisposable
{
    private readonly AppDbContext              _db;
    private readonly SafetyTaskGenerationService _sut;

    public SafetyTaskGenerationServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())   // isolated DB per test
            .Options;

        _db  = new AppDbContext(options);
        _sut = new SafetyTaskGenerationService(_db);
    }

    public void Dispose() => _db.Dispose();

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static TaskGenerationContext MakeContext(Guid familyId) => new()
    {
        FamilyId           = familyId,
        TriggeredByUserId  = null,
    };

    private static TaskGenerationSpec MakeSpec(Guid familyId, string generationKey,
        string title = "Test Task") => new()
    {
        GenerationKey = generationKey,
        SourceType    = TaskSourceType.FreeCheck,
        SourceId      = "test-source",
        FamilyId      = familyId,
        TargetType    = TaskTargetType.Family,
        Title         = title,
        Description   = "Description",
        WhyThisMatters = "It matters",
        Category      = TaskCategory.AccountSecurity,
        Priority      = TaskPriority.High,
        Phase         = TaskPhase.Immediate,
        SortOrder     = 1,
    };

    private async Task<SafetyTask?> GetTaskByKeyAsync(Guid familyId, string key)
        => await _db.SafetyTasks
            .FirstOrDefaultAsync(t => t.FamilyId == familyId
                                   && t.GenerationKey == key
                                   && t.SupersededByTaskId == null);

    // ── GenerateAsync — new task tests ────────────────────────────────────────

    [Fact]
    public async Task GenerateAsync_NewSpec_CreatesTask()
    {
        var familyId      = Guid.NewGuid();
        var generationKey = $"task:account:enable_2fa:{Guid.NewGuid():N}";
        var context       = MakeContext(familyId);
        var spec          = MakeSpec(familyId, generationKey);

        var result = await _sut.GenerateAsync(context, [spec]);

        await _db.SaveChangesAsync();

        Assert.Equal(1, result.CreatedCount);
        Assert.Equal(0, result.SkippedCount);

        var task = await GetTaskByKeyAsync(familyId, generationKey);
        Assert.NotNull(task);
        Assert.Equal(TaskStatus.Pending, task.Status);
        Assert.Equal(generationKey, task.GenerationKey);
    }

    [Fact]
    public async Task GenerateAsync_DuplicateKey_SkipsExistingTask()
    {
        // Pre-seed an active task with the same generation key
        var familyId      = Guid.NewGuid();
        var generationKey = $"task:account:enable_2fa:{Guid.NewGuid():N}";
        var spec          = MakeSpec(familyId, generationKey);

        // First generate → creates
        var context = MakeContext(familyId);
        await _sut.GenerateAsync(context, [spec]);
        await _db.SaveChangesAsync();

        // Second generate with identical spec → should skip
        var result = await _sut.GenerateAsync(context, [spec]);

        Assert.Equal(0, result.CreatedCount);
        Assert.Equal(1, result.SkippedCount);
    }

    [Fact]
    public async Task GenerateAsync_ContentChanged_RefreshesTaskInPlace()
    {
        var familyId      = Guid.NewGuid();
        var generationKey = $"task:device:enable_screen_lock:{Guid.NewGuid():N}";
        var context       = MakeContext(familyId);
        var spec          = MakeSpec(familyId, generationKey, title: "Original Title");

        await _sut.GenerateAsync(context, [spec]);
        await _db.SaveChangesAsync();

        // Update the spec's title — content changed
        var updatedSpec = MakeSpec(familyId, generationKey, title: "Updated Title");
        var result      = await _sut.GenerateAsync(context, [updatedSpec]);
        await _db.SaveChangesAsync();

        Assert.Equal(1, result.RefreshedCount);
        Assert.Equal(0, result.CreatedCount);

        var task = await GetTaskByKeyAsync(familyId, generationKey);
        Assert.NotNull(task);
        Assert.Equal("Updated Title", task.Title);
        Assert.Equal(generationKey, task.GenerationKey);   // key preserved on refresh
    }

    // ── GenerateAsync — C2 fix: re-create after Completed/Dismissed ───────────

    [Fact]
    public async Task GenerateAsync_CompletedExisting_RecreatesTask()
    {
        // C2 fix: a Completed task should be treated as "closed"; re-fire creates a new task.
        var familyId      = Guid.NewGuid();
        var generationKey = $"task:account:enable_2fa:{Guid.NewGuid():N}";
        var context       = MakeContext(familyId);
        var spec          = MakeSpec(familyId, generationKey);

        await _sut.GenerateAsync(context, [spec]);
        await _db.SaveChangesAsync();

        // Mark the task Completed
        var existing = await GetTaskByKeyAsync(familyId, generationKey);
        existing!.Status = TaskStatus.Completed;
        await _db.SaveChangesAsync();

        // Re-generate — should create a fresh task
        var result = await _sut.GenerateAsync(context, [spec]);
        await _db.SaveChangesAsync();

        Assert.Equal(1, result.CreatedCount);
    }

    [Fact]
    public async Task GenerateAsync_CompletedExisting_ClearsGenerationKeyOnOldTask()
    {
        // C2 fix: the old Completed task must have its GenerationKey nulled so the
        // unique index allows the new task with the same key.
        var familyId      = Guid.NewGuid();
        var generationKey = $"task:account:enable_2fa:{Guid.NewGuid():N}";
        var context       = MakeContext(familyId);
        var spec          = MakeSpec(familyId, generationKey);

        await _sut.GenerateAsync(context, [spec]);
        await _db.SaveChangesAsync();

        var completedTask = await GetTaskByKeyAsync(familyId, generationKey);
        completedTask!.Status = TaskStatus.Completed;
        await _db.SaveChangesAsync();
        var completedTaskId = completedTask.Id;

        await _sut.GenerateAsync(context, [spec]);
        await _db.SaveChangesAsync();

        var oldTask = await _db.SafetyTasks.FindAsync(completedTaskId);
        Assert.Null(oldTask!.GenerationKey);   // key must be cleared on the old task
    }

    [Fact]
    public async Task GenerateAsync_DismissedExisting_RecreatesTask()
    {
        var familyId      = Guid.NewGuid();
        var generationKey = $"task:account:enable_2fa:{Guid.NewGuid():N}";
        var context       = MakeContext(familyId);
        var spec          = MakeSpec(familyId, generationKey);

        await _sut.GenerateAsync(context, [spec]);
        await _db.SaveChangesAsync();

        var existing = await GetTaskByKeyAsync(familyId, generationKey);
        existing!.Status = TaskStatus.Dismissed;
        await _db.SaveChangesAsync();

        var result = await _sut.GenerateAsync(context, [spec]);
        await _db.SaveChangesAsync();

        Assert.Equal(1, result.CreatedCount);
    }

    // ── RegenerateAsync — supersession (C1 fix) tests ─────────────────────────

    [Fact]
    public async Task RegenerateAsync_ActiveExisting_SupersedesAndCreatesReplacement()
    {
        // C1 fix: RegenerateAsync must always supersede the old active task and create a new one.
        var familyId      = Guid.NewGuid();
        var generationKey = $"task:booking:free_check:{Guid.NewGuid():N}:1";
        var context       = MakeContext(familyId);
        var spec          = MakeSpec(familyId, generationKey);

        await _sut.GenerateAsync(context, [spec]);
        await _db.SaveChangesAsync();

        var originalTask = await GetTaskByKeyAsync(familyId, generationKey);
        var originalId   = originalTask!.Id;

        var result = await _sut.RegenerateAsync(context, [spec]);
        await _db.SaveChangesAsync();

        Assert.Equal(1, result.SupersededCount);
        // CreatedCount is 0 — SupersedeAndCreate reports Superseded action (embedding the create).

        // Old task should now be superseded (SupersededByTaskId set)
        var oldTask = await _db.SafetyTasks.FindAsync(originalId);
        Assert.NotNull(oldTask!.SupersededByTaskId);
        Assert.Equal(TaskStatus.Superseded, oldTask.Status);
    }

    [Fact]
    public async Task RegenerateAsync_ActiveExisting_ClearsGenerationKeyOnSupersededTask()
    {
        // C1 fix: GenerationKey must be nulled on the superseded task so the
        // unique index allows the new task with the same key.
        var familyId      = Guid.NewGuid();
        var generationKey = $"task:booking:free_check:{Guid.NewGuid():N}:1";
        var context       = MakeContext(familyId);
        var spec          = MakeSpec(familyId, generationKey);

        await _sut.GenerateAsync(context, [spec]);
        await _db.SaveChangesAsync();

        var original   = await GetTaskByKeyAsync(familyId, generationKey);
        var originalId = original!.Id;

        await _sut.RegenerateAsync(context, [spec]);
        await _db.SaveChangesAsync();

        var superseded = await _db.SafetyTasks.FindAsync(originalId);
        Assert.Null(superseded!.GenerationKey);   // key cleared — C1 fix
    }

    [Fact]
    public async Task RegenerateAsync_ActiveExisting_NewTaskHasCorrectGenerationKey()
    {
        var familyId      = Guid.NewGuid();
        var generationKey = $"task:booking:free_check:{Guid.NewGuid():N}:1";
        var context       = MakeContext(familyId);
        var spec          = MakeSpec(familyId, generationKey);

        await _sut.GenerateAsync(context, [spec]);
        await _db.SaveChangesAsync();

        await _sut.RegenerateAsync(context, [spec]);
        await _db.SaveChangesAsync();

        // The new (replacement) task should carry the same generation key
        var newTask = await GetTaskByKeyAsync(familyId, generationKey);
        Assert.NotNull(newTask);
        Assert.Equal(generationKey, newTask.GenerationKey);
        Assert.Equal(TaskStatus.Pending, newTask.Status);
    }

    // ── Multiple specs tests ──────────────────────────────────────────────────

    [Fact]
    public async Task GenerateAsync_MultipleSpecs_AllCreated()
    {
        var familyId = Guid.NewGuid();
        var context  = MakeContext(familyId);
        var specs    = Enumerable.Range(1, 3)
            .Select(i => MakeSpec(familyId, $"task:booking:free_check:{Guid.NewGuid():N}:{i}", $"Task {i}"))
            .ToList();

        var result = await _sut.GenerateAsync(context, specs);
        await _db.SaveChangesAsync();

        Assert.Equal(3, result.CreatedCount);
    }

    [Fact]
    public async Task GenerateAsync_EmptySpecs_ReturnsNoOpResult()
    {
        var context = MakeContext(Guid.NewGuid());

        var result = await _sut.GenerateAsync(context, []);

        Assert.True(result.WasNoOp);
        Assert.Equal(0, result.CreatedCount);
    }
}
