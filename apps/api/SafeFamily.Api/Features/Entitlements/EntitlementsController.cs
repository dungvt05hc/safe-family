using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SafeFamily.Api.Features.Entitlements.Dtos;

namespace SafeFamily.Api.Features.Entitlements;

[ApiController]
[Route("api/me/entitlements")]
[Authorize]
public class EntitlementsController : ControllerBase
{
    private readonly IEntitlementService _entitlementService;

    public EntitlementsController(IEntitlementService entitlementService)
    {
        _entitlementService = entitlementService;
    }

    // GET /api/me/entitlements
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<EntitlementResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMyEntitlements(CancellationToken ct)
    {
        var userId = GetUserId();
        var entitlements = await _entitlementService.GetMyEntitlementsAsync(userId, ct);
        return Ok(entitlements);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
