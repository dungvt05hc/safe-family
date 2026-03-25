using SafeFamily.Api.Domain.Assessments;

namespace SafeFamily.Api.Features.Assessments;

/// <summary>
/// Computes per-category scores, an overall score, a risk level, and
/// a prioritised list of immediate action recommendations from a set of
/// question answers.  All logic is pure (no I/O) so it is trivially testable.
/// </summary>
public class RiskScoringService
{
    // Thresholds (inclusive lower bound) for risk level bands
    private const int LowThreshold = 75;
    private const int MediumThreshold = 50;
    private const int HighThreshold = 25;

    // Category weights that sum to 1.0 for overall score calculation
    private static readonly Dictionary<AssessmentCategory, double> CategoryWeights = new()
    {
        [AssessmentCategory.AccountSecurity] = 0.30,
        [AssessmentCategory.DeviceHygiene]   = 0.25,
        [AssessmentCategory.BackupRecovery]  = 0.20,
        [AssessmentCategory.PrivacySharing]  = 0.15,
        [AssessmentCategory.ScamReadiness]   = 0.10,
    };

    /// <summary>
    /// Computes the full scoring result from a map of questionId → selectedOptionValue.
    /// Unknown question IDs and unrecognised option values are silently skipped.
    /// </summary>
    public ScoringResult Compute(IReadOnlyDictionary<string, string> answers)
    {
        // Build a lookup: questionId → question definition
        var questionMap = AssessmentQuestionBank.All
            .ToDictionary(q => q.Id, q => q);

        // Accumulate raw scores per category: total earned vs. total possible
        var earned   = new Dictionary<AssessmentCategory, int>();
        var possible = new Dictionary<AssessmentCategory, int>();

        foreach (AssessmentCategory cat in Enum.GetValues<AssessmentCategory>())
        {
            earned[cat]   = 0;
            possible[cat] = 0;
        }

        foreach (var question in AssessmentQuestionBank.All)
        {
            var maxOption = question.Options.Max(o => o.Score);
            possible[question.Category] += maxOption;

            if (answers.TryGetValue(question.Id, out var selectedValue))
            {
                var option = question.Options.FirstOrDefault(o => o.Value == selectedValue);
                if (option is not null)
                    earned[question.Category] += option.Score;
                // If option not found and question is required → 0 earned (already initialised)
            }
            // If question not answered → 0 earned
        }

        // Calculate category scores as 0–100
        var categoryScores = new Dictionary<AssessmentCategory, int>();
        foreach (var cat in Enum.GetValues<AssessmentCategory>())
        {
            var max = possible[cat];
            categoryScores[cat] = max == 0
                ? 100
                : (int)Math.Round(earned[cat] * 100.0 / max);
        }

        // Weighted overall score
        double weightedSum = CategoryWeights.Sum(kv => kv.Value * categoryScores[kv.Key]);
        int overallScore = (int)Math.Round(weightedSum);

        var riskLevel = overallScore >= LowThreshold    ? RiskLevel.Low
                      : overallScore >= MediumThreshold ? RiskLevel.Medium
                      : overallScore >= HighThreshold   ? RiskLevel.High
                                                        : RiskLevel.Critical;

        var immediateActions = BuildImmediateActions(categoryScores, answers);

        return new ScoringResult(overallScore, categoryScores, riskLevel, immediateActions);
    }

    // ── Action recommendation logic ───────────────────────────────────────────

    private static IReadOnlyList<string> BuildImmediateActions(
        Dictionary<AssessmentCategory, int> categoryScores,
        IReadOnlyDictionary<string, string> answers)
    {
        var actions = new List<(int priority, string action)>();

        // Account Security actions
        if (answers.TryGetValue("acc_mfa", out var mfa) && mfa is "none" or "some")
            actions.Add((1, "Enable two-factor authentication (2FA) on all critical accounts — especially email and banking."));

        if (answers.TryGetValue("acc_passwords", out var pwd) && pwd is "reuse" or "written")
            actions.Add((2, "Start using a password manager (e.g. Bitwarden, 1Password) and use unique passwords for every account."));

        if (answers.TryGetValue("acc_suspicious", out var susp) && susp is "yes_unresolved")
            actions.Add((1, "Investigate and resolve the suspicious account activity you identified — change passwords and review recent access immediately."));

        if (categoryScores[AssessmentCategory.AccountSecurity] < 50)
            actions.Add((2, "Review and tighten security settings for all important accounts."));

        // Device Hygiene actions
        if (answers.TryGetValue("dev_updates", out var upd) && upd is "never" or "delayed")
            actions.Add((2, "Enable automatic OS and security updates on all devices to stay protected against known vulnerabilities."));

        if (answers.TryGetValue("dev_screenlock", out var lock_) && lock_ == "none")
            actions.Add((1, "Enable screen lock (PIN, password, or biometric) on all your devices immediately."));

        if (answers.TryGetValue("dev_eol", out var eol) && eol is "multiple" or "one")
            actions.Add((2, "Plan to replace or upgrade end-of-life devices that no longer receive security patches."));

        if (answers.TryGetValue("dev_findmy", out var findmy) && findmy == "no")
            actions.Add((3, "Enable 'Find My Device' / remote-wipe features on your smartphones and laptops."));

        // Backup & Recovery actions
        if (answers.TryGetValue("bkp_frequency", out var bkpFreq) && bkpFreq is "never" or "yearly")
            actions.Add((2, "Set up regular automated backups for your important files — aim for at least monthly."));

        if (answers.TryGetValue("bkp_offsite", out var bkpLoc) && bkpLoc is "nowhere" or "local")
            actions.Add((2, "Store backups in at least two locations (local + cloud) to protect against hardware failure or ransomware."));

        if (answers.TryGetValue("bkp_tested", out var bkpTest) && bkpTest == "never")
            actions.Add((3, "Test restoring from backup at least once to confirm your backups actually work."));

        // Privacy & Sharing actions
        if (answers.TryGetValue("prv_social", out var social) && social is "public" or "default")
            actions.Add((2, "Review and restrict privacy settings on your social media profiles to limit public exposure."));

        if (answers.TryGetValue("prv_wifi", out var wifi) && wifi == "no_caution")
            actions.Add((2, "Avoid transmitting sensitive data over public Wi-Fi, or use a VPN when you must."));

        // Scam Readiness actions
        if (answers.TryGetValue("scm_phishing", out var phish) && phish is "not_confident" or "somewhat")
            actions.Add((2, "Take a short phishing-awareness quiz or training to sharpen your ability to spot fake emails and websites."));

        if (answers.TryGetValue("scm_family", out var fam) && fam == "never")
            actions.Add((2, "Have a family conversation about common online scams — children and elderly relatives are frequently targeted."));

        if (answers.TryGetValue("scm_incident", out var plan) && plan == "no")
            actions.Add((3, "Create a simple incident response plan: who to call, which passwords to change, and how to report if someone is scammed."));

        // Return top 5 actions ordered by priority
        return actions
            .OrderBy(a => a.priority)
            .Select(a => a.action)
            .Distinct()
            .Take(5)
            .ToList();
    }
}

/// <summary>Immutable result produced by <see cref="RiskScoringService.Compute"/>.</summary>
public sealed record ScoringResult(
    int OverallScore,
    IReadOnlyDictionary<AssessmentCategory, int> CategoryScores,
    RiskLevel RiskLevel,
    IReadOnlyList<string> ImmediateActions);
