using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SafeFamily.Api.Features.Families.Dtos;

namespace SafeFamily.Api.Features.Families;

[ApiController]
[Route("api/family-members")]
[Authorize]
public class FamilyMembersController : ControllerBase
{
    private readonly IFamilyMemberService _familyMemberService;

    public FamilyMembersController(IFamilyMemberService familyMemberService)
    {
        _familyMemberService = familyMemberService;
    }

    // GET /api/family-members
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<FamilyMemberResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMembers(CancellationToken ct)
    {
        var userId = GetUserId();
        var members = await _familyMemberService.GetMembersAsync(userId, ct);
        return Ok(members);
    }

    // POST /api/family-members
    [HttpPost]
    [ProducesResponseType(typeof(FamilyMemberResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateMember([FromBody] CreateFamilyMemberRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        var member = await _familyMemberService.CreateMemberAsync(userId, request, ct);
        return CreatedAtAction(nameof(GetMembers), member);
    }

    // PUT /api/family-members/{id}
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(FamilyMemberResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMember(Guid id, [FromBody] UpdateFamilyMemberRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        var member = await _familyMemberService.UpdateMemberAsync(userId, id, request, ct);

        if (member is null)
            return NotFound();

        return Ok(member);
    }

    // DELETE /api/family-members/{id}
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ArchiveMember(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();
        var found = await _familyMemberService.ArchiveMemberAsync(userId, id, ct);

        if (!found)
            return NotFound();

        return NoContent();
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
