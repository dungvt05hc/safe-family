using SafeFamily.Api.Domain.Assessments;
using SafeFamily.Api.Features.Assessments;
using Xunit;

namespace SafeFamily.Tests.Features.Assessments;

public class RiskScoringServiceTests
{
    private readonly RiskScoringService _sut = new();

    // ── Best answers (score = 100 per option) ────────────────────────────────
    private static readonly Dictionary<string, string> AllBestAnswers = new()
    {
        ["acc_mfa"]          = "all",
        ["acc_passwords"]    = "manager",
        ["acc_recovery"]     = "all",
        ["acc_suspicious"]   = "no",
        ["acc_review"]       = "regularly",
        ["dev_updates"]      = "immediate",
        ["dev_screenlock"]   = "all",
        ["dev_findmy"]       = "yes",
        ["dev_eol"]          = "no",
        ["dev_antivirus"]    = "full",
        ["bkp_frequency"]    = "weekly",
        ["bkp_offsite"]      = "both",
        ["bkp_tested"]       = "recent",
        ["bkp_cloud"]        = "yes",
        ["prv_social"]       = "reviewed",
        ["prv_location"]     = "minimal",
        ["prv_data_sharing"] = "always",
        ["prv_wifi"]         = "vpn",
        ["scm_phishing"]     = "very",
        ["scm_unsolicited"]  = "verify_first",
        ["scm_family"]       = "regularly",
        ["scm_incident"]     = "yes",
    };

    // ── Worst answers (score = 0 per option) ─────────────────────────────────
    private static readonly Dictionary<string, string> AllWorstAnswers = new()
    {
        ["acc_mfa"]          = "none",
        ["acc_passwords"]    = "reuse",
        ["acc_recovery"]     = "no",
        ["acc_suspicious"]   = "yes_unresolved",
        ["acc_review"]       = "never",
        ["dev_updates"]      = "never",
        ["dev_screenlock"]   = "none",
        ["dev_findmy"]       = "no",
        ["dev_eol"]          = "multiple",
        ["dev_antivirus"]    = "no",
        ["bkp_frequency"]    = "never",
        ["bkp_offsite"]      = "nowhere",
        ["bkp_tested"]       = "never",
        ["bkp_cloud"]        = "no",
        ["prv_social"]       = "public",
        ["prv_location"]     = "always_on",
        ["prv_data_sharing"] = "never",
        ["prv_wifi"]         = "no_caution",
        ["scm_phishing"]     = "not_confident",
        ["scm_unsolicited"]  = "comply",
        ["scm_family"]       = "never",
        ["scm_incident"]     = "no",
    };

    // ── Overall score and risk level ─────────────────────────────────────────

    [Fact]
    public void Compute_AllBestAnswers_ReturnsOverallHundred()
    {
        var result = _sut.Compute(AllBestAnswers);

        Assert.Equal(100, result.OverallScore);
    }

    [Fact]
    public void Compute_AllBestAnswers_ReturnsLowRisk()
    {
        var result = _sut.Compute(AllBestAnswers);

        Assert.Equal(RiskLevel.Low, result.RiskLevel);
    }

    [Fact]
    public void Compute_AllBestAnswers_ReturnsNoImmediateActions()
    {
        var result = _sut.Compute(AllBestAnswers);

        Assert.Empty(result.ImmediateActions);
    }

    [Fact]
    public void Compute_AllWorstAnswers_ReturnsZeroOverallScore()
    {
        var result = _sut.Compute(AllWorstAnswers);

        Assert.Equal(0, result.OverallScore);
    }

    [Fact]
    public void Compute_AllWorstAnswers_ReturnsCriticalRisk()
    {
        var result = _sut.Compute(AllWorstAnswers);

        Assert.Equal(RiskLevel.Critical, result.RiskLevel);
    }

    [Fact]
    public void Compute_EmptyAnswers_ReturnsZeroOverallScore()
    {
        var result = _sut.Compute(new Dictionary<string, string>());

        Assert.Equal(0, result.OverallScore);
    }

    [Fact]
    public void Compute_EmptyAnswers_ReturnsCriticalRisk()
    {
        var result = _sut.Compute(new Dictionary<string, string>());

        Assert.Equal(RiskLevel.Critical, result.RiskLevel);
    }

    [Fact]
    public void Compute_EmptyAnswers_AllCategoryScoresAreZero()
    {
        var result = _sut.Compute(new Dictionary<string, string>());

        foreach (AssessmentCategory cat in Enum.GetValues<AssessmentCategory>())
            Assert.Equal(0, result.CategoryScores[cat]);
    }

    // ── Risk level thresholds ─────────────────────────────────────────────────

    [Fact]
    public void Compute_Score100_ReturnsLowRisk()
    {
        // All best answers → overall = 100 (≥75 → Low)
        var result = _sut.Compute(AllBestAnswers);
        Assert.Equal(RiskLevel.Low, result.RiskLevel);
        Assert.Equal(100, result.OverallScore);
    }

    [Fact]
    public void Compute_AccountAndDeviceAndBackupBest_ReturnsLowRisk()
    {
        // AccountSecurity(0.30) + DeviceHygiene(0.25) + BackupRecovery(0.20) = 75 → Low boundary
        var answers = BuildCategoryOnlyAnswers(
            AssessmentCategory.AccountSecurity,
            AssessmentCategory.DeviceHygiene,
            AssessmentCategory.BackupRecovery);

        var result = _sut.Compute(answers);

        Assert.Equal(75, result.OverallScore);
        Assert.Equal(RiskLevel.Low, result.RiskLevel);
    }

    [Fact]
    public void Compute_AccountAndDeviceBest_ReturnsMediumRisk()
    {
        // AccountSecurity(0.30) + DeviceHygiene(0.25) = 55 → Medium (50–74)
        var answers = BuildCategoryOnlyAnswers(
            AssessmentCategory.AccountSecurity,
            AssessmentCategory.DeviceHygiene);

        var result = _sut.Compute(answers);

        Assert.Equal(55, result.OverallScore);
        Assert.Equal(RiskLevel.Medium, result.RiskLevel);
    }

    [Fact]
    public void Compute_AccountOnlyBest_ReturnsHighRisk()
    {
        // AccountSecurity(0.30) = 30 → High (25–49)
        var answers = BuildCategoryOnlyAnswers(AssessmentCategory.AccountSecurity);

        var result = _sut.Compute(answers);

        Assert.Equal(30, result.OverallScore);
        Assert.Equal(RiskLevel.High, result.RiskLevel);
    }

    [Fact]
    public void Compute_Score0_ReturnsCriticalRisk()
    {
        // All worst answers → 0 (<25 → Critical)
        var result = _sut.Compute(AllWorstAnswers);
        Assert.Equal(RiskLevel.Critical, result.RiskLevel);
        Assert.Equal(0, result.OverallScore);
    }

    // ── Category scores ───────────────────────────────────────────────────────

    [Fact]
    public void Compute_AllBestAnswers_AllCategoryScoresAre100()
    {
        var result = _sut.Compute(AllBestAnswers);

        foreach (AssessmentCategory cat in Enum.GetValues<AssessmentCategory>())
            Assert.Equal(100, result.CategoryScores[cat]);
    }

    [Fact]
    public void Compute_AllWorstAnswers_AllCategoryScoresAreZero()
    {
        var result = _sut.Compute(AllWorstAnswers);

        foreach (AssessmentCategory cat in Enum.GetValues<AssessmentCategory>())
            Assert.Equal(0, result.CategoryScores[cat]);
    }

    [Fact]
    public void Compute_PartialAnswers_UnansweredQuestionsContributeZeroToEarned()
    {
        // Only answer acc_mfa="all" (score 100, max 100); other 4 acc questions unanswered.
        // possible[AccountSecurity] = 500 (5 questions × max 100 each)
        // earned[AccountSecurity]   = 100
        // categoryScore = round(100*100/500) = 20
        var answers = new Dictionary<string, string> { ["acc_mfa"] = "all" };

        var result = _sut.Compute(answers);

        Assert.Equal(20, result.CategoryScores[AssessmentCategory.AccountSecurity]);
    }

    [Fact]
    public void Compute_UnknownQuestionId_IsIgnored()
    {
        var answers = new Dictionary<string, string>(AllBestAnswers)
        {
            ["unknown_question_xyz"] = "some_value",
        };

        var resultWithExtra  = _sut.Compute(answers);
        var resultWithout    = _sut.Compute(AllBestAnswers);

        Assert.Equal(resultWithout.OverallScore, resultWithExtra.OverallScore);
        Assert.Equal(resultWithout.RiskLevel,    resultWithExtra.RiskLevel);
    }

    [Fact]
    public void Compute_UnknownOptionValue_TreatedAsZeroForThatQuestion()
    {
        var answers = new Dictionary<string, string>(AllBestAnswers)
        {
            ["acc_mfa"] = "not_a_real_option",
        };

        var result = _sut.Compute(answers);

        // acc_mfa earns 0; all other acc questions earn 100.
        // earned = 400 / possible = 500 → 80
        Assert.Equal(80, result.CategoryScores[AssessmentCategory.AccountSecurity]);
    }

    // ── Weighted overall score ────────────────────────────────────────────────

    [Fact]
    public void Compute_WeightedOverall_AccountSecurityOnlyBest_ReturnsThirtyPercent()
    {
        // AccountSecurity weight = 0.30; all best → contributes 0.30 * 100 = 30
        // All other categories → 0
        var answers = BuildCategoryOnlyAnswers(AssessmentCategory.AccountSecurity);

        var result = _sut.Compute(answers);

        Assert.Equal(30, result.OverallScore);
    }

    [Fact]
    public void Compute_WeightedOverall_DeviceHygieneOnlyBest_ReturnsTwentyFivePercent()
    {
        // DeviceHygiene weight = 0.25 → contributes 25
        var answers = BuildCategoryOnlyAnswers(AssessmentCategory.DeviceHygiene);

        var result = _sut.Compute(answers);

        Assert.Equal(25, result.OverallScore);
    }

    [Fact]
    public void Compute_WeightedOverall_AllCategoriesBest_SumsToHundred()
    {
        // 0.30 + 0.25 + 0.20 + 0.15 + 0.10 = 1.00 → 100
        var result = _sut.Compute(AllBestAnswers);

        Assert.Equal(100, result.OverallScore);
    }

    // ── Immediate actions ─────────────────────────────────────────────────────

    [Fact]
    public void Compute_MfaAnsweredNone_IncludesMfaAction()
    {
        var answers = new Dictionary<string, string> { ["acc_mfa"] = "none" };

        var result = _sut.Compute(answers);

        Assert.Contains(result.ImmediateActions, a =>
            a.Contains("two-factor", StringComparison.OrdinalIgnoreCase) ||
            a.Contains("2FA", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void Compute_ScreenLockNone_IncludesScreenLockAction()
    {
        var answers = new Dictionary<string, string> { ["dev_screenlock"] = "none" };

        var result = _sut.Compute(answers);

        Assert.Contains(result.ImmediateActions, a =>
            a.Contains("screen lock", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void Compute_SuspiciousActivityUnresolved_IncludesInvestigateAction()
    {
        var answers = new Dictionary<string, string> { ["acc_suspicious"] = "yes_unresolved" };

        var result = _sut.Compute(answers);

        Assert.Contains(result.ImmediateActions, a =>
            a.Contains("suspicious", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void Compute_PasswordsReused_IncludesPasswordManagerAction()
    {
        var answers = new Dictionary<string, string> { ["acc_passwords"] = "reuse" };

        var result = _sut.Compute(answers);

        Assert.Contains(result.ImmediateActions, a =>
            a.Contains("password manager", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void Compute_ManyPoorAnswers_ImmediateActionsNeverExceedsFive()
    {
        var result = _sut.Compute(AllWorstAnswers);

        Assert.True(result.ImmediateActions.Count <= 5,
            $"Expected ≤ 5 immediate actions but got {result.ImmediateActions.Count}.");
    }

    [Fact]
    public void Compute_AllBestAnswers_ImmediateActionsIsEmpty()
    {
        var result = _sut.Compute(AllBestAnswers);

        Assert.Empty(result.ImmediateActions);
    }

    [Fact]
    public void Compute_ImmediateActions_AreDistinct()
    {
        var result = _sut.Compute(AllWorstAnswers);

        var unique = result.ImmediateActions.Distinct().ToList();
        Assert.Equal(unique.Count, result.ImmediateActions.Count);
    }

    // ── Result completeness ───────────────────────────────────────────────────

    [Fact]
    public void Compute_CategoryScores_ContainsAllFiveCategories()
    {
        var result = _sut.Compute(AllBestAnswers);

        foreach (AssessmentCategory cat in Enum.GetValues<AssessmentCategory>())
            Assert.True(result.CategoryScores.ContainsKey(cat),
                $"Missing category score for {cat}.");
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /// <summary>Returns best-option answers for only the given categories (others empty → score 0).</summary>
    private static Dictionary<string, string> BuildCategoryOnlyAnswers(
        params AssessmentCategory[] categories)
    {
        var set = categories.ToHashSet();
        return AllBestAnswers
            .Where(kv =>
            {
                var q = AssessmentQuestionBank.All.FirstOrDefault(q => q.Id == kv.Key);
                return q is not null && set.Contains(q.Category);
            })
            .ToDictionary(kv => kv.Key, kv => kv.Value);
    }
}
