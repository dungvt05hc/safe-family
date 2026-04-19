using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SafeFamily.Api.Features.Plans.Dtos;

namespace SafeFamily.Api.Features.Plans;

[ApiController]
[Route("api/plans")]
[Authorize]
public class PlansController(IPlansService plansService) : ControllerBase
{
    // ── Family Safety Plan ────────────────────────────────────────────────────

    // GET /api/plans/safety
    [HttpGet("safety")]
    [ProducesResponseType(typeof(IReadOnlyList<FamilySafetyPlanDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status402PaymentRequired)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetSafetyPlans(CancellationToken ct)
    {
        var plans = await plansService.GetSafetyPlansAsync(GetUserId(), ct);
        return Ok(plans);
    }

    // GET /api/plans/safety/{id}
    [HttpGet("safety/{id:guid}")]
    [ProducesResponseType(typeof(FamilySafetyPlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status402PaymentRequired)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSafetyPlanById(Guid id, CancellationToken ct)
    {
        var plan = await plansService.GetSafetyPlanByIdAsync(GetUserId(), id, ct);
        return Ok(plan);
    }

    // ── Incident Recovery Pack ────────────────────────────────────────────────

    // GET /api/plans/incident-recovery
    [HttpGet("incident-recovery")]
    [ProducesResponseType(typeof(IReadOnlyList<IncidentRecoveryPackDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status402PaymentRequired)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetIncidentRecoveryPacks(CancellationToken ct)
    {
        var packs = await plansService.GetIncidentRecoveryPacksAsync(GetUserId(), ct);
        return Ok(packs);
    }

    // GET /api/plans/incident-recovery/{id}
    [HttpGet("incident-recovery/{id:guid}")]
    [ProducesResponseType(typeof(IncidentRecoveryPackDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status402PaymentRequired)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetIncidentRecoveryPackById(Guid id, CancellationToken ct)
    {
        var pack = await plansService.GetIncidentRecoveryPackByIdAsync(GetUserId(), id, ct);
        return Ok(pack);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
