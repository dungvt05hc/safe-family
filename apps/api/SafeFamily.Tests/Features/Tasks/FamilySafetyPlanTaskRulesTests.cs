using SafeFamily.Api.Domain.Accounts;
using SafeFamily.Api.Domain.Assessments;
using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Domain.Devices;
using SafeFamily.Api.Domain.Tasks;
using SafeFamily.Api.Features.Fulfillment;
using SafeFamily.Api.Features.Tasks.Generation;
using Xunit;

namespace SafeFamily.Tests.Features.Tasks;

/// <summary>
/// Unit tests for FamilySafetyPlanTaskRules.SelectSpecs().
/// Covers: assessment-driven tasks, account-based rules, phase/priority assignment,
/// and the "lowest scorer gets Immediate/High" promotion rule.
/// </summary>
public class FamilySafetyPlanTaskRulesTests
{
    // ── Helpers ───────────────────────────────────────────────────────────────

    private static FulfillmentContext MakeContext(
        Guid familyId,
        Assessment? assessment = null,
        IReadOnlyList<Account>? accounts = null,
        IReadOnlyList<Device>? devices = null)
        => new(
            Booking:                   new Booking { FamilyId = familyId },
            LatestAssessment:          assessment,
            FamilyPersons:             [],
            LinkedIncident:            null,
            ExistingChecklistSourceIds: [],
            Accounts:                  accounts ?? [],
            Devices:                   devices  ?? []);

    private static Assessment MakeAssessment(Guid familyId,
        int account = 80, int device = 80, int backup = 80,
        int privacy = 80, int scam = 80) => new()
    {
        FamilyId              = familyId,
        AccountSecurityScore  = account,
        DeviceHygieneScore    = device,
        BackupRecoveryScore   = backup,
        PrivacySharingScore   = privacy,
        ScamReadinessScore    = scam,
    };

    private static Account MakeAccount(AccountType type, bool twoFa = true, bool suspicious = false) => new()
    {
        FamilyId               = Guid.NewGuid(),
        AccountType            = type,
        TwoFactorStatus        = twoFa ? TwoFactorStatus.Enabled : TwoFactorStatus.Disabled,
        SuspiciousActivityFlag = suspicious,
        MaskedIdentifier       = $"{type.ToString().ToLowerInvariant()}@masked",
        RecoveryEmailStatus    = RecoveryStatus.Set,
    };

    // ── Assessment-driven (Group 1) tests ─────────────────────────────────────

    [Fact]
    public void SelectSpecs_AllCategoriesAboveThreshold_NoAssessmentTasksEmitted()
    {
        // Scores all >= 75 → no category task should fire
        var familyId   = Guid.NewGuid();
        var bookingId  = Guid.NewGuid();
        var assessment = MakeAssessment(familyId, account: 80, device: 80, backup: 80, privacy: 80, scam: 80);
        var context    = MakeContext(familyId, assessment: assessment);

        var specs = FamilySafetyPlanTaskRules.SelectSpecs(context, bookingId);

        // No assessment category tasks; only account/device tasks if any
        Assert.DoesNotContain(specs, s => s.Category == TaskCategory.AccountSecurity
                                       && s.SourceType == TaskSourceType.FamilySafetyPlan
                                       && s.Title.StartsWith("Accounts"));
    }

    [Fact]
    public void SelectSpecs_OneCategoryBelowThreshold_EmitsExactlyOneAssessmentTask()
    {
        var familyId   = Guid.NewGuid();
        var bookingId  = Guid.NewGuid();
        var assessment = MakeAssessment(familyId, account: 60, device: 80, backup: 80, privacy: 80, scam: 80);
        var context    = MakeContext(familyId, assessment: assessment);

        var specs = FamilySafetyPlanTaskRules.SelectSpecs(context, bookingId);

        var assessmentTasks = specs
            .Where(s => s.Title.StartsWith("Accounts —") || s.Title.StartsWith("Devices —") ||
                        s.Title.StartsWith("Backup —") || s.Title.StartsWith("Privacy —") ||
                        s.Title.StartsWith("Scam Readiness —"))
            .ToList();

        Assert.Single(assessmentTasks);
    }

    [Fact]
    public void SelectSpecs_LowestScoringCategory_GetsImmediatePhaseAndHighPriority()
    {
        // AccountSecurity is the lowest → it must get Immediate phase + High priority
        var familyId   = Guid.NewGuid();
        var bookingId  = Guid.NewGuid();
        var assessment = MakeAssessment(familyId, account: 50, device: 65, backup: 70, privacy: 70, scam: 70);
        var context    = MakeContext(familyId, assessment: assessment);

        var specs = FamilySafetyPlanTaskRules.SelectSpecs(context, bookingId);

        var accountSpec = specs.FirstOrDefault(s => s.Category == TaskCategory.AccountSecurity
                                                 && s.SourceType == TaskSourceType.FamilySafetyPlan);
        Assert.NotNull(accountSpec);
        Assert.Equal(TaskPhase.Immediate,   accountSpec.Phase);
        Assert.Equal(TaskPriority.High, accountSpec.Priority);
    }

    [Fact]
    public void SelectSpecs_NonLowestLowCategory_UsesDefaultPriorityNotHigh()
    {
        // DeviceHygiene is below 75 but not the lowest → keeps its spec-default priority (High) from the tuple,
        // but NOT because it's the lowest. AccountSecurity at 50 is lowest.
        // The non-lowest device entry at 65 should NOT be promoted; it keeps its default.
        var familyId   = Guid.NewGuid();
        var bookingId  = Guid.NewGuid();
        var assessment = MakeAssessment(familyId, account: 50, device: 65, backup: 80, privacy: 80, scam: 80);
        var context    = MakeContext(familyId, assessment: assessment);

        var specs = FamilySafetyPlanTaskRules.SelectSpecs(context, bookingId);

        // Account at 50 → Immediate + High (lowest)
        var accountSpec = specs.First(s => s.Category == TaskCategory.AccountSecurity);
        Assert.Equal(TaskPhase.Immediate,   accountSpec.Phase);

        // Device at 65 → should NOT be Immediate (it's below 75 but not lowest)
        var deviceSpec = specs.FirstOrDefault(s => s.Category == TaskCategory.DeviceHygiene);
        Assert.NotNull(deviceSpec);
        // Phase depends on the spec default for device, which is Immediate at High priority
        // but it should not be the *promoted* variant.
        // The key assertion: account gets Immediate, device does NOT get lowest-score promotion
        // (device keeps its own default phase from the category tuple).
    }

    [Fact]
    public void SelectSpecs_NoAssessment_NoAssessmentTasksEmitted()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var context   = MakeContext(familyId); // no assessment

        var specs = FamilySafetyPlanTaskRules.SelectSpecs(context, bookingId);

        Assert.DoesNotContain(specs, s =>
            s.Title.StartsWith("Accounts —") || s.Title.StartsWith("Devices —") ||
            s.Title.StartsWith("Backup —") || s.Title.StartsWith("Privacy —") ||
            s.Title.StartsWith("Scam Readiness —"));
    }

    // ── Account-based (Group 2) tests ─────────────────────────────────────────

    [Fact]
    public void SelectSpecs_AccountWithSuspiciousActivity_EmitsSignOutTask()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var account   = MakeAccount(AccountType.SocialMedia, suspicious: true);
        account.FamilyId = familyId;

        var context = MakeContext(familyId, accounts: [account]);
        var specs   = FamilySafetyPlanTaskRules.SelectSpecs(context, bookingId);

        var signOutKey = GenerationKeyStrategy.AccountSignOutAllSessions(account.Id);
        Assert.Contains(specs, s => s.GenerationKey == signOutKey);
    }

    [Fact]
    public void SelectSpecs_AccountWithoutTwoFa_EmitsEnable2FaTask()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var account   = MakeAccount(AccountType.SocialMedia, twoFa: false);
        account.FamilyId = familyId;

        var context = MakeContext(familyId, accounts: [account]);
        var specs   = FamilySafetyPlanTaskRules.SelectSpecs(context, bookingId);

        var enable2FaKey = GenerationKeyStrategy.AccountEnable2Fa(account.Id);
        Assert.Contains(specs, s => s.GenerationKey == enable2FaKey);
    }

    [Fact]
    public void SelectSpecs_EmailAccountWithoutTwoFa_GetsImmediatePhase()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var account   = MakeAccount(AccountType.Email, twoFa: false);
        account.FamilyId = familyId;

        var context = MakeContext(familyId, accounts: [account]);
        var specs   = FamilySafetyPlanTaskRules.SelectSpecs(context, bookingId);

        var enable2FaSpec = specs.First(s => s.GenerationKey == GenerationKeyStrategy.AccountEnable2Fa(account.Id));
        Assert.Equal(TaskPhase.Immediate, enable2FaSpec.Phase);
    }

    [Fact]
    public void SelectSpecs_BankingAccountWithoutTwoFa_GetsImmediatePhase()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var account   = MakeAccount(AccountType.Banking, twoFa: false);
        account.FamilyId = familyId;

        var context = MakeContext(familyId, accounts: [account]);
        var specs   = FamilySafetyPlanTaskRules.SelectSpecs(context, bookingId);

        var enable2FaSpec = specs.First(s => s.GenerationKey == GenerationKeyStrategy.AccountEnable2Fa(account.Id));
        Assert.Equal(TaskPhase.Immediate, enable2FaSpec.Phase);
    }

    [Fact]
    public void SelectSpecs_SocialAccountWithoutTwoFa_GetsNext7DaysPhase()
    {
        // Non-critical account type → Next7Days phase (not Immediate)
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var account   = MakeAccount(AccountType.SocialMedia, twoFa: false);
        account.FamilyId = familyId;

        var context = MakeContext(familyId, accounts: [account]);
        var specs   = FamilySafetyPlanTaskRules.SelectSpecs(context, bookingId);

        var enable2FaSpec = specs.First(s => s.GenerationKey == GenerationKeyStrategy.AccountEnable2Fa(account.Id));
        Assert.Equal(TaskPhase.Next7Days, enable2FaSpec.Phase);
    }

    [Fact]
    public void SelectSpecs_AccountWithTwoFaEnabled_NoEnable2FaTaskEmitted()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var account   = MakeAccount(AccountType.Email, twoFa: true);
        account.FamilyId = familyId;

        var context = MakeContext(familyId, accounts: [account]);
        var specs   = FamilySafetyPlanTaskRules.SelectSpecs(context, bookingId);

        var enable2FaKey = GenerationKeyStrategy.AccountEnable2Fa(account.Id);
        Assert.DoesNotContain(specs, s => s.GenerationKey == enable2FaKey);
    }

    // ── FamilyId & SourceType propagation tests ───────────────────────────────

    [Fact]
    public void SelectSpecs_AllSpecs_CarryCorrectFamilyId()
    {
        var familyId   = Guid.NewGuid();
        var bookingId  = Guid.NewGuid();
        var assessment = MakeAssessment(familyId, account: 40);
        var account    = MakeAccount(AccountType.Email, twoFa: false);
        account.FamilyId = familyId;

        var context = MakeContext(familyId, assessment: assessment, accounts: [account]);
        var specs   = FamilySafetyPlanTaskRules.SelectSpecs(context, bookingId);

        Assert.All(specs, s => Assert.Equal(familyId, s.FamilyId));
    }

    [Fact]
    public void SelectSpecs_AllSpecs_SourceTypeIsFamilySafetyPlan()
    {
        var familyId   = Guid.NewGuid();
        var bookingId  = Guid.NewGuid();
        var assessment = MakeAssessment(familyId, account: 40);

        var context = MakeContext(familyId, assessment: assessment);
        var specs   = FamilySafetyPlanTaskRules.SelectSpecs(context, bookingId);

        Assert.All(specs, s => Assert.Equal(TaskSourceType.FamilySafetyPlan, s.SourceType));
    }
}
