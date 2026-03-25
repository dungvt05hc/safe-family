using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    // GET /api/accounts
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AccountResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAccounts(CancellationToken ct)
    {
        var userId = GetUserId();
        var accounts = await _accountService.GetAccountsAsync(userId, ct);
        return Ok(accounts);
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

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
