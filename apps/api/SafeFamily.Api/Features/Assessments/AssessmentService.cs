using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Assessments;
using SafeFamily.Api.Features.Assessments.Dtos;

namespace SafeFamily.Api.Features.Assessments;

public class AssessmentService : IAssessmentService
{
    private readonly AppDbContext _db;
    private readonly RiskScoringService _scorer;

    public AssessmentService(AppDbContext db, RiskScoringService scorer)
    {
        _db = db;
        _scorer = scorer;
    }

    /// <inheritdoc />
    public IReadOnlyList<AssessmentQuestionDto> GetQuestions() =>
        AssessmentQuestionBank.All
            .Select(q => new AssessmentQuestionDto(
                q.Id,
                q.Category.ToString(),
                q.Text,
                q.Options.Select(o => new QuestionOptionDto(o.Value, o.Label)).ToList(),
                q.IsRequired))
            .ToList();

    /// <inheritdoc />
    public async Task<AssessmentResponse> CreateAssessmentAsync(
        Guid userId,
        CreateAssessmentRequest request,
        CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        // Build the answer dictionary
        var answerMap = request.Answers
            .GroupBy(a => a.QuestionId)               // deduplicate: last one wins
            .ToDictionary(g => g.Key, g => g.Last().SelectedValue);

        var result = _scorer.Compute(answerMap);

        var assessment = new Assessment
        {
            FamilyId              = familyId,
            OverallScore          = result.OverallScore,
            AccountSecurityScore  = result.CategoryScores[AssessmentCategory.AccountSecurity],
            DeviceHygieneScore    = result.CategoryScores[AssessmentCategory.DeviceHygiene],
            BackupRecoveryScore   = result.CategoryScores[AssessmentCategory.BackupRecovery],
            PrivacySharingScore   = result.CategoryScores[AssessmentCategory.PrivacySharing],
            ScamReadinessScore    = result.CategoryScores[AssessmentCategory.ScamReadiness],
            RiskLevel             = result.RiskLevel,
            CreatedById           = userId,
            UpdatedById           = userId,
            Answers               = answerMap.Select(kv => new AssessmentAnswer
            {
                QuestionId = kv.Key,
                Score      = ScoreForAnswer(kv.Key, kv.Value),
            }).ToList(),
        };

        _db.Assessments.Add(assessment);
        await _db.SaveChangesAsync(ct);

        return ToResponse(assessment, result.ImmediateActions);
    }

    /// <inheritdoc />
    public async Task<AssessmentResponse?> GetLatestAssessmentAsync(
        Guid userId,
        CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var assessment = await _db.Assessments
            .Include(a => a.Answers)
            .Where(a => a.FamilyId == familyId)
            .OrderByDescending(a => a.CreatedAt)
            .FirstOrDefaultAsync(ct);

        if (assessment is null)
            return null;

        // Recompute immediate actions from persisted answers so we don't have to store them
        var answerMap = assessment.Answers.ToDictionary(a => a.QuestionId, _ => (string?)null);
        // We only need the answer values to regenerate actions; re-run score from stored category scores
        var immediateActions = RebuildImmediateActions(assessment);

        return ToResponse(assessment, immediateActions);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<Guid> RequireFamilyIdAsync(Guid userId, CancellationToken ct)
    {
        var familyId = await _db.FamilyMembers
            .Where(m => m.UserId == userId)
            .Select(m => (Guid?)m.FamilyId)
            .FirstOrDefaultAsync(ct);

        if (familyId is null)
            throw new ForbiddenException("You must be part of a family to submit or view assessments.");

        return familyId.Value;
    }

    private static int ScoreForAnswer(string questionId, string selectedValue)
    {
        var question = AssessmentQuestionBank.All.FirstOrDefault(q => q.Id == questionId);
        if (question is null) return 0;
        return question.Options.FirstOrDefault(o => o.Value == selectedValue)?.Score ?? 0;
    }

    /// <summary>
    /// Rebuilds immediate actions from a persisted assessment's stored category scores
    /// without re-running the full answer-based computation (answers are stored by score only,
    /// not original value). Uses category score thresholds as a simplified fallback.
    /// </summary>
    private static IReadOnlyList<string> RebuildImmediateActions(Assessment assessment)
    {
        var actions = new List<string>();

        if (assessment.AccountSecurityScore < 50)
            actions.Add("Review and strengthen security on all important accounts — enable 2FA and use a password manager.");
        if (assessment.DeviceHygieneScore < 50)
            actions.Add("Update all devices to the latest OS version and enable screen lock and Find My Device features.");
        if (assessment.BackupRecoveryScore < 50)
            actions.Add("Set up regular automated backups stored in at least two locations (local + cloud).");
        if (assessment.PrivacySharingScore < 50)
            actions.Add("Review privacy settings on social media and limit location sharing to essential apps only.");
        if (assessment.ScamReadinessScore < 50)
            actions.Add("Educate your family about phishing and scams, and create a simple incident response plan.");

        return actions.Take(5).ToList();
    }

    private static AssessmentResponse ToResponse(Assessment assessment, IReadOnlyList<string> immediateActions) =>
        new(
            assessment.Id,
            assessment.FamilyId,
            assessment.OverallScore,
            [
                new CategoryScoreDto("accountSecurity", assessment.AccountSecurityScore),
                new CategoryScoreDto("deviceHygiene",   assessment.DeviceHygieneScore),
                new CategoryScoreDto("backupRecovery",  assessment.BackupRecoveryScore),
                new CategoryScoreDto("privacySharing",  assessment.PrivacySharingScore),
                new CategoryScoreDto("scamReadiness",   assessment.ScamReadinessScore),
            ],
            assessment.RiskLevel.ToString(),
            immediateActions,
            assessment.CreatedAt);
}
