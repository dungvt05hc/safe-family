using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SafeFamily.Api.Common.Services;
using SafeFamily.Api.Features.Tasks.Dtos;

namespace SafeFamily.Api.Features.Tasks;

[ApiController]
[Route("api/tasks")]
[Authorize]
public class SafetyTasksController : ControllerBase
{
    private readonly ISafetyTaskService _tasks;
    private readonly IAuditLogService   _audit;

    public SafetyTasksController(ISafetyTaskService tasks, IAuditLogService audit)
    {
        _tasks = tasks;
        _audit = audit;
    }

    // GET /api/tasks
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SafetyTaskDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status402PaymentRequired)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetTasks([FromQuery] SafetyTaskQueryParams query, CancellationToken ct)
    {
        var tasks = await _tasks.GetTasksAsync(GetUserId(), query, ct);
        return Ok(tasks);
    }

    // GET /api/tasks/{id}
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SafetyTaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status402PaymentRequired)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTask(Guid id, CancellationToken ct)
    {
        var task = await _tasks.GetTaskByIdAsync(GetUserId(), id, ct);
        return task is null ? NotFound() : Ok(task);
    }

    // GET /api/tasks/summary
    [HttpGet("summary")]
    [ProducesResponseType(typeof(SafetyTaskSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status402PaymentRequired)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetSummary(CancellationToken ct)
    {
        var summary = await _tasks.GetSummaryAsync(GetUserId(), ct);
        return Ok(summary);
    }

    // PATCH /api/tasks/{id}/status
    [HttpPatch("{id:guid}/status")]
    [EnableRateLimiting("mutations")]
    [ProducesResponseType(typeof(SafetyTaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status402PaymentRequired)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(
        Guid id, [FromBody] UpdateSafetyTaskStatusRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await _tasks.UpdateStatusAsync(userId, id, request, ct);

        await _audit.LogAsync("SafetyTaskStatusUpdated", userId,
            entityType: "SafetyTask", entityId: id,
            details: $"Status={result.Status}", ct: ct);

        return Ok(result);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException());
}
