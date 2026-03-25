using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SafeFamily.Api.Features.Families.Dtos;

namespace SafeFamily.Api.Features.Families;

[ApiController]
[Route("api/families")]
[Authorize]
public class FamiliesController : ControllerBase
{
    private readonly IFamilyService _familyService;

    public FamiliesController(IFamilyService familyService)
    {
        _familyService = familyService;
    }

    // POST /api/families
    [HttpPost]
    [ProducesResponseType(typeof(FamilyResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateFamily([FromBody] CreateFamilyRequest request, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var family = await _familyService.CreateFamilyAsync(userId, request, ct);
        return CreatedAtAction(nameof(GetMyFamily), family);
    }

    // GET /api/families/me
    [HttpGet("me")]
    [ProducesResponseType(typeof(FamilyResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMyFamily(CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var family = await _familyService.GetMyFamilyAsync(userId, ct);

        if (family is null)
            return NotFound();

        return Ok(family);
    }
}
