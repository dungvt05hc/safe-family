using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SafeFamily.Api.Features.Assessments.Dtos;

namespace SafeFamily.Api.Features.Assessments;

[ApiController]
[Route("api/assessments")]
[Authorize]
public class AssessmentsController : ControllerBase
{
    private readonly IAssessmentService _assessmentService;

    public AssessmentsController(IAssessmentService assessmentService)
    {
        _assessmentService = assessmentService;
    }

    // GET /api/assessments/questions
    [HttpGet("questions")]
    [ProducesResponseType(typeof(IReadOnlyList<AssessmentQuestionDto>), StatusCodes.Status200OK)]
    public IActionResult GetQuestions()
    {
        var questions = _assessmentService.GetQuestions();
        return Ok(questions);
    }

    // POST /api/assessments
    [HttpPost]
    [ProducesResponseType(typeof(AssessmentResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateAssessment(
        [FromBody] CreateAssessmentRequest request,
        CancellationToken ct)
    {
        var userId = GetUserId();
        var assessment = await _assessmentService.CreateAssessmentAsync(userId, request, ct);
        return CreatedAtAction(nameof(GetLatestAssessment), assessment);
    }

    // GET /api/assessments/latest
    [HttpGet("latest")]
    [ProducesResponseType(typeof(AssessmentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLatestAssessment(CancellationToken ct)
    {
        var userId = GetUserId();
        var assessment = await _assessmentService.GetLatestAssessmentAsync(userId, ct);

        if (assessment is null)
            return NotFound();

        return Ok(assessment);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
