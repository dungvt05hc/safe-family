using Microsoft.AspNetCore.Mvc;

namespace SafeFamily.Api.Features.Health;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(HealthResponse), StatusCodes.Status200OK)]
    public IActionResult Get()
    {
        return Ok(new HealthResponse("healthy", DateTimeOffset.UtcNow));
    }
}

public record HealthResponse(string Status, DateTimeOffset Timestamp);
