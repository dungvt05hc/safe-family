using SafeFamily.Api.Domain.Tasks;
using SafeFamily.Api.Features.Tasks;
using Xunit;
using TaskStatus = SafeFamily.Api.Domain.Tasks.TaskStatus;

namespace SafeFamily.Tests.Features.Tasks;

/// <summary>
/// Unit tests for SafetyTaskService.IsValidTransition().
/// Exercises the full state machine: allowed moves, forbidden moves,
/// Superseded lock-out, and same-status no-op rejection.
/// </summary>
public class StatusTransitionTests
{
    // ── Allowed transitions ───────────────────────────────────────────────────

    [Theory]
    [InlineData(TaskStatus.Pending,    TaskStatus.InProgress)]
    [InlineData(TaskStatus.Pending,    TaskStatus.Completed)]
    [InlineData(TaskStatus.Pending,    TaskStatus.Dismissed)]
    [InlineData(TaskStatus.InProgress, TaskStatus.Completed)]
    [InlineData(TaskStatus.InProgress, TaskStatus.Dismissed)]
    [InlineData(TaskStatus.InProgress, TaskStatus.Pending)]
    [InlineData(TaskStatus.Completed,  TaskStatus.Pending)]
    [InlineData(TaskStatus.Dismissed,  TaskStatus.Pending)]
    public void IsValidTransition_AllowedMove_ReturnsTrue(TaskStatus from, TaskStatus to)
    {
        Assert.True(SafetyTaskService.IsValidTransition(from, to));
    }

    // ── Forbidden transitions ─────────────────────────────────────────────────

    [Theory]
    [InlineData(TaskStatus.Completed,  TaskStatus.InProgress)]
    [InlineData(TaskStatus.Completed,  TaskStatus.Dismissed)]
    [InlineData(TaskStatus.Dismissed,  TaskStatus.InProgress)]
    [InlineData(TaskStatus.Dismissed,  TaskStatus.Completed)]
    public void IsValidTransition_ForbiddenMove_ReturnsFalse(TaskStatus from, TaskStatus to)
    {
        Assert.False(SafetyTaskService.IsValidTransition(from, to));
    }

    // ── Superseded lock-out tests ─────────────────────────────────────────────

    [Theory]
    [InlineData(TaskStatus.Superseded, TaskStatus.Pending)]
    [InlineData(TaskStatus.Superseded, TaskStatus.InProgress)]
    [InlineData(TaskStatus.Superseded, TaskStatus.Completed)]
    [InlineData(TaskStatus.Superseded, TaskStatus.Dismissed)]
    public void IsValidTransition_FromSuperseded_AlwaysReturnsFalse(TaskStatus from, TaskStatus to)
    {
        Assert.False(SafetyTaskService.IsValidTransition(from, to));
    }

    [Theory]
    [InlineData(TaskStatus.Pending,    TaskStatus.Superseded)]
    [InlineData(TaskStatus.InProgress, TaskStatus.Superseded)]
    [InlineData(TaskStatus.Completed,  TaskStatus.Superseded)]
    [InlineData(TaskStatus.Dismissed,  TaskStatus.Superseded)]
    public void IsValidTransition_ToSuperseded_AlwaysReturnsFalse(TaskStatus from, TaskStatus to)
    {
        Assert.False(SafetyTaskService.IsValidTransition(from, to));
    }

    // ── Same-status no-op rejection tests ─────────────────────────────────────

    [Theory]
    [InlineData(TaskStatus.Pending)]
    [InlineData(TaskStatus.InProgress)]
    [InlineData(TaskStatus.Completed)]
    [InlineData(TaskStatus.Dismissed)]
    [InlineData(TaskStatus.Superseded)]
    public void IsValidTransition_SameStatus_ReturnsFalse(TaskStatus status)
    {
        Assert.False(SafetyTaskService.IsValidTransition(status, status));
    }
}
