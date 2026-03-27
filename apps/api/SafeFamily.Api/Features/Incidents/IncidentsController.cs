using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SafeFamily.Api.Common.Services;
using SafeFamily.Api.Features.Incidents.Dtos;

namespace SafeFamily.Api.Features.Incidents;

[ApiController]
[Route("api/incidents")]
[Authorize]
public class IncidentsController : ControllerBase
{
    private readonly IIncidentService _incidentService;
    private readonly IAuditLogService _audit;

    public IncidentsController(IIncidentService incidentService, IAuditLogService audit)
    {
        _incidentService = incidentService;
        _audit = audit;
    }

    // GET /api/incidents
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<IncidentResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetIncidents(CancellationToken ct)
    {
        var incidents = await _incidentService.GetIncidentsAsync(GetUserId(), ct);
        return Ok(incidents);
    }

    // GET /api/incidents/{id}
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(IncidentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetIncident(Guid id, CancellationToken ct)
    {
        var incident = await _incidentService.GetIncidentByIdAsync(GetUserId(), id, ct);

        if (incident is null)
            return NotFound();

        return Ok(incident);
    }

    // POST /api/incidents
    [HttpPost]
    [EnableRateLimiting("mutations")]
    [ProducesResponseType(typeof(IncidentResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateIncident([FromBody] CreateIncidentRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        var incident = await _incidentService.CreateIncidentAsync(userId, request, ct);
        await _audit.LogAsync("IncidentCreated", userId, entityType: "Incident", entityId: incident.Id,
            details: $"Type={incident.Type} Severity={incident.Severity}", ct: ct);
        return CreatedAtAction(nameof(GetIncident), new { id = incident.Id }, incident);
    }

    // PATCH /api/incidents/{id}/status
    [HttpPatch("{id:guid}/status")]
    [EnableRateLimiting("mutations")]
    [ProducesResponseType(typeof(IncidentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateIncidentStatusRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await _incidentService.UpdateIncidentStatusAsync(userId, id, request, ct);

        if (result is null)
            return NotFound();

        await _audit.LogAsync("IncidentStatusUpdated", userId, entityType: "Incident", entityId: id,
            details: $"Status={result.Status}", ct: ct);

        return Ok(result);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
