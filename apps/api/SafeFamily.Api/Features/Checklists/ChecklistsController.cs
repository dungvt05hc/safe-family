using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SafeFamily.Api.Features.Checklists.Dtos;

namespace SafeFamily.Api.Features.Checklists;

[ApiController]
[Route("api/checklists")]
[Authorize]
public class ChecklistsController : ControllerBase
{
    private readonly IChecklistService _checklistService;

    public ChecklistsController(IChecklistService checklistService)
    {
        _checklistService = checklistService;
    }

    // GET /api/checklists?severity=high&status=todo&category=AccountSecurity&search=...
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ChecklistItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetChecklist(
        [FromQuery] string? severity,
        [FromQuery] string? status,
        [FromQuery] string? category,
        [FromQuery] string? search,
        CancellationToken ct)
    {
        var query = new ChecklistQueryParams(severity, status, category, search);
        var items = await _checklistService.GetChecklistAsync(GetUserId(), query, ct);
        return Ok(items);
    }

    // GET /api/checklists/summary
    [HttpGet("summary")]
    [ProducesResponseType(typeof(ChecklistSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetSummary(CancellationToken ct)
    {
        var summary = await _checklistService.GetSummaryAsync(GetUserId(), ct);
        return Ok(summary);
    }

    // PATCH /api/checklists/{id}/status
    [HttpPatch("{id:guid}/status")]
    [ProducesResponseType(typeof(ChecklistItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        [FromBody] UpdateChecklistStatusRequest request,
        CancellationToken ct)
    {
        var updated = await _checklistService.UpdateStatusAsync(GetUserId(), id, request, ct);
        return Ok(updated);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
