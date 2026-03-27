using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SafeFamily.Api.Domain.Accounts;
using SafeFamily.Api.Features.Accounts.Dtos;

namespace SafeFamily.Api.Features.Accounts;

[ApiController]
[Route("api/accounts")]
[Authorize]
public class AccountsController : ControllerBase
{
    private readonly IAccountService _accountService;

    public AccountsController(IAccountService accountService)
    {
        _accountService = accountService;
    }

    // GET /api/accounts?memberId=...&accountType=...&search=...
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AccountResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAccounts(
        [FromQuery] Guid? memberId,
        [FromQuery] AccountType? accountType,
        [FromQuery] string? search,
        CancellationToken ct)
    {
        var userId = GetUserId();
        var query = new AccountQuery { MemberId = memberId, AccountType = accountType, Search = search };
        var accounts = await _accountService.GetAccountsAsync(userId, query, ct);
        return Ok(accounts);
    }

    // GET /api/accounts/summary
    [HttpGet("summary")]
    [ProducesResponseType(typeof(AccountSummaryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetSummary(CancellationToken ct)
    {
        var userId = GetUserId();
        var summary = await _accountService.GetSummaryAsync(userId, ct);
        return Ok(summary);
    }

    // GET /api/accounts/{id}
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AccountResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAccount(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();
        var account = await _accountService.GetAccountByIdAsync(userId, id, ct);

        if (account is null)
            return NotFound();

        return Ok(account);
    }

    // POST /api/accounts
    [HttpPost]
    [ProducesResponseType(typeof(AccountResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateAccount([FromBody] CreateAccountRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        var account = await _accountService.CreateAccountAsync(userId, request, ct);
        return CreatedAtAction(nameof(GetAccount), new { id = account.Id }, account);
    }

    // PUT /api/accounts/{id}
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AccountResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAccount(Guid id, [FromBody] UpdateAccountRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        var account = await _accountService.UpdateAccountAsync(userId, id, request, ct);

        if (account is null)
            return NotFound();

        return Ok(account);
    }

    // DELETE /api/accounts/{id}  (soft-archive)
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ArchiveAccount(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();
        var found = await _accountService.ArchiveAccountAsync(userId, id, ct);

        if (!found)
            return NotFound();

        return NoContent();
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}

