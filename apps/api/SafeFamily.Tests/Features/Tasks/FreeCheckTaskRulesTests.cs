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
/// Unit tests for FreeCheckTaskRules.SelectTopSpecs().
/// Verifies the 3-task cap, weight-based selection, fallback filling,
/// GenerationKey format, and assessment score boost behaviour.
/// </summary>
public class FreeCheckTaskRulesTests
{
    // ── Helpers ───────────────────────────────────────────────────────────────

    private static Booking MakeBooking(Guid familyId) => new() { FamilyId = familyId };

    private static FulfillmentContext MakeContext(
        Guid familyId,
        Assessment? assessment = null,
        IReadOnlyList<Account>? accounts = null,
        IReadOnlyList<Device>? devices = null)
        => new(
            Booking:                   MakeBooking(familyId),
            LatestAssessment:          assessment,
            FamilyPersons:             [],
            LinkedIncident:            null,
            ExistingChecklistSourceIds: [],
            Accounts:                  accounts ?? [],
            Devices:                   devices  ?? []);

    private static Account MakeEmailAccount(bool twoFa = true, bool suspicious = false) => new()
    {
        FamilyId             = Guid.NewGuid(),
        AccountType          = AccountType.Email,
        TwoFactorStatus      = twoFa ? TwoFactorStatus.Enabled : TwoFactorStatus.Disabled,
        SuspiciousActivityFlag = suspicious,
        MaskedIdentifier     = "u***@example.com",
        RecoveryEmailStatus  = RecoveryStatus.Set,
    };

    private static Account MakeBankingAccount(bool twoFa = true) => new()
    {
        FamilyId             = Guid.NewGuid(),
        AccountType          = AccountType.Banking,
        TwoFactorStatus      = twoFa ? TwoFactorStatus.Enabled : TwoFactorStatus.Disabled,
        SuspiciousActivityFlag = false,
        MaskedIdentifier     = "****1234",
        RecoveryEmailStatus  = RecoveryStatus.NotSet,
    };

    private static Device MakeDevice(bool screenLock = true, bool backup = true,
        SupportStatus support = SupportStatus.Supported) => new()
    {
        FamilyId       = Guid.NewGuid(),
        ScreenLockEnabled = screenLock,
        BackupEnabled  = backup,
        SupportStatus  = support,
    };

    // ── Cap & fallback tests ──────────────────────────────────────────────────

    [Fact]
    public void SelectTopSpecs_NoAccountsNoDevices_ReturnsTwoFallbacks()
    {
        // With no data to trigger any data-driven rule, only the two booking-keyed
        // fallback tasks (breach check + connected apps review) are returned.
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var context   = MakeContext(familyId);

        var specs = FreeCheckTaskRules.SelectTopSpecs(context, bookingId);

        Assert.Equal(2, specs.Count);
    }

    [Fact]
    public void SelectTopSpecs_ManyRulesFire_ReturnsAtMostThreeTasks()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();

        // Trigger all 7 data-driven rules: suspicious, no-email-2fa, no-bank-2fa,
        // no screen lock, no backup, end-of-life device, no recovery email.
        var accounts = new List<Account>
        {
            new() { FamilyId = familyId, AccountType = AccountType.Email,   TwoFactorStatus = TwoFactorStatus.Disabled,
                    SuspiciousActivityFlag = true, MaskedIdentifier = "u@e.com", RecoveryEmailStatus = RecoveryStatus.NotSet },
            new() { FamilyId = familyId, AccountType = AccountType.Banking, TwoFactorStatus = TwoFactorStatus.Disabled,
                    SuspiciousActivityFlag = false, MaskedIdentifier = "bank",  RecoveryEmailStatus = RecoveryStatus.NotSet },
        };
        var devices = new List<Device>
        {
            MakeDevice(screenLock: false, backup: false, support: SupportStatus.EndOfLife),
        };

        var context = MakeContext(familyId, accounts: accounts, devices: devices);
        var specs   = FreeCheckTaskRules.SelectTopSpecs(context, bookingId);

        Assert.Equal(3, specs.Count);
    }

    [Fact]
    public void SelectTopSpecs_OneDataRuleFires_FillsRemainingWithFallbacks()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();

        // Only one data rule: no screen lock
        var devices = new List<Device> { MakeDevice(screenLock: false) };
        var context = MakeContext(familyId, devices: devices);

        var specs = FreeCheckTaskRules.SelectTopSpecs(context, bookingId);

        // 1 data task + 2 fallbacks = 3
        Assert.Equal(3, specs.Count);
    }

    // ── Weight ordering tests ─────────────────────────────────────────────────

    [Fact]
    public void SelectTopSpecs_SuspiciousActivity_IsAlwaysSelectedFirst()
    {
        // SuspiciousActivity weight=95 must beat EmailNo2Fa(90), BankingNo2Fa(85) etc.
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();

        var suspiciousAccount = new Account
        {
            FamilyId = familyId, AccountType = AccountType.Email,
            TwoFactorStatus = TwoFactorStatus.Disabled,
            SuspiciousActivityFlag = true,
            MaskedIdentifier = "sus@example.com",
            RecoveryEmailStatus = RecoveryStatus.NotSet,
        };

        var context = MakeContext(familyId, accounts: [suspiciousAccount]);
        var specs   = FreeCheckTaskRules.SelectTopSpecs(context, bookingId);

        // First selected spec carries the sign-out-all-sessions generation key
        Assert.Contains(GenerationKeyStrategy.AccountSignOutAllSessions(suspiciousAccount.Id),
            specs[0].GenerationKey);
    }

    [Fact]
    public void SelectTopSpecs_TopThreeByWeight_MatchExpectedRules()
    {
        // With SuspiciousActivity(95), EmailNo2Fa(90), BankingNo2Fa(85) all
        // triggered, those three should be the exact selection.
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();

        var emailAccount = new Account
        {
            FamilyId = familyId, AccountType = AccountType.Email,
            TwoFactorStatus = TwoFactorStatus.Disabled,
            SuspiciousActivityFlag = true, MaskedIdentifier = "e@e.com",
            RecoveryEmailStatus = RecoveryStatus.NotSet,
        };
        var bankAccount = new Account
        {
            FamilyId = familyId, AccountType = AccountType.Banking,
            TwoFactorStatus = TwoFactorStatus.Disabled,
            SuspiciousActivityFlag = false, MaskedIdentifier = "bank",
            RecoveryEmailStatus = RecoveryStatus.NotSet,
        };

        var context = MakeContext(familyId, accounts: [emailAccount, bankAccount]);
        var specs   = FreeCheckTaskRules.SelectTopSpecs(context, bookingId);

        var keys = specs.Select(s => s.GenerationKey).ToHashSet();
        Assert.Contains(GenerationKeyStrategy.AccountSignOutAllSessions(emailAccount.Id), keys);
        Assert.Contains(GenerationKeyStrategy.AccountEnable2Fa(emailAccount.Id),          keys);
        Assert.Contains(GenerationKeyStrategy.AccountEnable2Fa(bankAccount.Id),           keys);
        // Fallbacks must NOT be present — all 3 slots filled by data rules
        Assert.DoesNotContain(keys, k => k != null && k.StartsWith("task:booking:free_check"));
    }

    // ── GenerationKey format tests ────────────────────────────────────────────

    [Fact]
    public void SelectTopSpecs_EmailNo2Fa_GenerationKeyUsesAccountId()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var account   = MakeEmailAccount(twoFa: false);
        account.FamilyId = familyId;

        var context = MakeContext(familyId, accounts: [account]);
        var specs   = FreeCheckTaskRules.SelectTopSpecs(context, bookingId);

        var enable2FaKey = GenerationKeyStrategy.AccountEnable2Fa(account.Id);
        Assert.Contains(specs, s => s.GenerationKey == enable2FaKey);
    }

    [Fact]
    public void SelectTopSpecs_NoScreenLock_GenerationKeyUsesDeviceId()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var device    = MakeDevice(screenLock: false);
        device.FamilyId = familyId;

        var context = MakeContext(familyId, devices: [device]);
        var specs   = FreeCheckTaskRules.SelectTopSpecs(context, bookingId);

        var screenLockKey = GenerationKeyStrategy.DeviceEnableScreenLock(device.Id);
        Assert.Contains(specs, s => s.GenerationKey == screenLockKey);
    }

    [Fact]
    public void SelectTopSpecs_FallbackTasks_GenerationKeysAreBookingScoped()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var context   = MakeContext(familyId);   // no accounts or devices → all fallbacks

        var specs = FreeCheckTaskRules.SelectTopSpecs(context, bookingId);

        // Fallback keys must contain the bookingId, not any entity ID
        var bookingIdN = bookingId.ToString("N");
        Assert.All(specs, s => Assert.Contains(bookingIdN, s.GenerationKey));
    }

    [Fact]
    public void SelectTopSpecs_FallbackTasks_SourceTypeIsFreeCheck()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var context   = MakeContext(familyId);

        var specs = FreeCheckTaskRules.SelectTopSpecs(context, bookingId);

        Assert.All(specs, s => Assert.Equal(TaskSourceType.FreeCheck, s.SourceType));
    }

    // ── Assessment boost test ─────────────────────────────────────────────────

    [Fact]
    public void SelectTopSpecs_LowAccountScore_DataRulesStillBeatingFallbacks()
    {
        // When AccountSecurityScore < 50, a +5 boost is applied to account data rules.
        // An email account without 2FA should still be selected over any fallback.
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var assessment = new Assessment { FamilyId = familyId, AccountSecurityScore = 30 };
        var account    = MakeEmailAccount(twoFa: false);
        account.FamilyId = familyId;

        var context = MakeContext(familyId, assessment: assessment, accounts: [account]);
        var specs   = FreeCheckTaskRules.SelectTopSpecs(context, bookingId);

        var enable2FaKey = GenerationKeyStrategy.AccountEnable2Fa(account.Id);
        Assert.Contains(specs, s => s.GenerationKey == enable2FaKey);
    }

    // ── FamilyId propagation test ─────────────────────────────────────────────

    [Fact]
    public void SelectTopSpecs_AllSpecs_CarryCorrectFamilyId()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var context   = MakeContext(familyId);

        var specs = FreeCheckTaskRules.SelectTopSpecs(context, bookingId);

        Assert.All(specs, s => Assert.Equal(familyId, s.FamilyId));
    }
}
