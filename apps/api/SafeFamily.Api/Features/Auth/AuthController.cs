using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Common.Services;
using SafeFamily.Api.Features.Auth.Dtos;

namespace SafeFamily.Api.Features.Auth;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IAuditLogService _audit;

    public AuthController(IAuthService authService, IAuditLogService audit)
    {
        _authService = authService;
        _audit = audit;
    }

    // POST /api/auth/register
    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(typeof(AuthUserResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var user = await _authService.RegisterAsync(request, ct);
        await _audit.LogAsync("RegisterSuccess", user.Id, user.Email, ipAddress: GetIp(), ct: ct);
        await SignInAsync(user);
        return CreatedAtAction(nameof(Me), user);
    }

    // POST /api/auth/login
    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(typeof(AuthUserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        try
        {
            var user = await _authService.LoginAsync(request, ct);
            await _audit.LogAsync("LoginSuccess", user.Id, user.Email, ipAddress: GetIp(), ct: ct);
            await SignInAsync(user);
            return Ok(user);
        }
        catch (UnauthorizedException)
        {
            // Log failure without revealing whether the email exists
            await _audit.LogAsync("LoginFailure", userEmail: request.Email.Trim().ToLowerInvariant(), details: "Invalid credentials", ipAddress: GetIp(), ct: ct);
            throw;
        }
    }

    // POST /api/auth/logout
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok();
    }

    // GET /api/auth/me
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(AuthUserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _authService.GetCurrentUserAsync(userId, ct);

        if (user is null)
            throw new NotFoundException("User", userId);

        return Ok(user);
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private async Task SignInAsync(AuthUserResponse user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.DisplayName),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
        };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);
    }

    private string? GetIp() =>
        HttpContext.Connection.RemoteIpAddress?.ToString();
}
