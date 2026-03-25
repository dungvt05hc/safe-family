using SafeFamily.Api.Domain.Accounts;
using SafeFamily.Api.Domain.Devices;
using SafeFamily.Api.Domain.Checklists;
using SafeFamily.Api.Features.Checklists;
using Xunit;

namespace SafeFamily.Tests.Features.Checklists;

public class ChecklistGenerationServiceTests
{
    private readonly ChecklistGenerationService _sut = new();

    // ── Account: TwoFactorStatus ──────────────────────────────────────────────

    [Fact]
    public void Account_TwoFactorDisabled_GeneratesTwoFactorItem()
    {
        var account = MakeAccount(twoFactor: TwoFactorStatus.Disabled);

        var items = _sut.Generate([account], []);

        Assert.Contains(items, i =>
            i.SourceId == $"acc-2fa:{account.Id}" &&
            i.Priority == 1 &&
            i.Category == ChecklistCategory.AccountSecurity);
    }

    [Theory]
    [InlineData(TwoFactorStatus.Enabled)]
    [InlineData(TwoFactorStatus.Unknown)]
    public void Account_TwoFactorNotDisabled_DoesNotGenerateTwoFactorItem(TwoFactorStatus status)
    {
        var account = MakeAccount(twoFactor: status);

        var items = _sut.Generate([account], []);

        Assert.DoesNotContain(items, i => i.SourceId == $"acc-2fa:{account.Id}");
    }

    // ── Account: RecoveryEmailStatus ─────────────────────────────────────────

    [Fact]
    public void Account_RecoveryEmailNotSet_GeneratesRecoveryEmailItem()
    {
        var account = MakeAccount(recoveryEmail: RecoveryStatus.NotSet);

        var items = _sut.Generate([account], []);

        Assert.Contains(items, i =>
            i.SourceId == $"acc-recovery-email:{account.Id}" &&
            i.Priority == 2 &&
            i.Category == ChecklistCategory.AccountSecurity);
    }

    [Theory]
    [InlineData(RecoveryStatus.Set)]
    [InlineData(RecoveryStatus.Unknown)]
    public void Account_RecoveryEmailSet_DoesNotGenerateRecoveryEmailItem(RecoveryStatus status)
    {
        var account = MakeAccount(recoveryEmail: status);

        var items = _sut.Generate([account], []);

        Assert.DoesNotContain(items, i => i.SourceId == $"acc-recovery-email:{account.Id}");
    }

    // ── Account: RecoveryPhoneStatus ─────────────────────────────────────────

    [Fact]
    public void Account_RecoveryPhoneNotSet_GeneratesRecoveryPhoneItem()
    {
        var account = MakeAccount(recoveryPhone: RecoveryStatus.NotSet);

        var items = _sut.Generate([account], []);

        Assert.Contains(items, i =>
            i.SourceId == $"acc-recovery-phone:{account.Id}" &&
            i.Priority == 2);
    }

    // ── Account: SuspiciousActivityFlag ──────────────────────────────────────

    [Fact]
    public void Account_SuspiciousActivityFlagged_GeneratesSuspiciousItem()
    {
        var account = MakeAccount(suspicious: true);

        var items = _sut.Generate([account], []);

        Assert.Contains(items, i =>
            i.SourceId == $"acc-suspicious:{account.Id}" &&
            i.Priority == 1);
    }

    [Fact]
    public void Account_NoSuspiciousActivity_DoesNotGenerateSuspiciousItem()
    {
        var account = MakeAccount(suspicious: false);

        var items = _sut.Generate([account], []);

        Assert.DoesNotContain(items, i => i.SourceId == $"acc-suspicious:{account.Id}");
    }

    // ── Device: SupportStatus ────────────────────────────────────────────────

    [Fact]
    public void Device_EndOfLife_GeneratesEolItem()
    {
        var device = MakeDevice(support: SupportStatus.EndOfLife);

        var items = _sut.Generate([], [device]);

        Assert.Contains(items, i =>
            i.SourceId == $"dev-eol:{device.Id}" &&
            i.Priority == 1 &&
            i.Category == ChecklistCategory.DeviceHygiene);
    }

    [Fact]
    public void Device_NoLongerReceivingUpdates_GeneratesNoUpdatesItem()
    {
        var device = MakeDevice(support: SupportStatus.NoLongerReceivingUpdates);

        var items = _sut.Generate([], [device]);

        Assert.Contains(items, i =>
            i.SourceId == $"dev-no-updates:{device.Id}" &&
            i.Priority == 1);
    }

    [Theory]
    [InlineData(SupportStatus.Supported)]
    [InlineData(SupportStatus.Unknown)]
    public void Device_Supported_DoesNotGenerateEolItems(SupportStatus status)
    {
        var device = MakeDevice(support: status);

        var items = _sut.Generate([], [device]);

        Assert.DoesNotContain(items, i => i.SourceId == $"dev-eol:{device.Id}");
        Assert.DoesNotContain(items, i => i.SourceId == $"dev-no-updates:{device.Id}");
    }

    // ── Device: ScreenLock ───────────────────────────────────────────────────

    [Fact]
    public void Device_ScreenLockDisabled_GeneratesScreenLockItem()
    {
        var device = MakeDevice(screenLock: false);

        var items = _sut.Generate([], [device]);

        Assert.Contains(items, i =>
            i.SourceId == $"dev-screenlock:{device.Id}" &&
            i.Priority == 1 &&
            i.Category == ChecklistCategory.DeviceHygiene);
    }

    [Fact]
    public void Device_ScreenLockEnabled_DoesNotGenerateScreenLockItem()
    {
        var device = MakeDevice(screenLock: true);

        var items = _sut.Generate([], [device]);

        Assert.DoesNotContain(items, i => i.SourceId == $"dev-screenlock:{device.Id}");
    }

    // ── Device: Backup ───────────────────────────────────────────────────────

    [Fact]
    public void Device_BackupDisabled_GeneratesBackupItem()
    {
        var device = MakeDevice(backup: false);

        var items = _sut.Generate([], [device]);

        Assert.Contains(items, i =>
            i.SourceId == $"dev-backup:{device.Id}" &&
            i.Priority == 1 &&
            i.Category == ChecklistCategory.BackupRecovery);
    }

    [Fact]
    public void Device_BackupEnabled_DoesNotGenerateBackupItem()
    {
        var device = MakeDevice(backup: true);

        var items = _sut.Generate([], [device]);

        Assert.DoesNotContain(items, i => i.SourceId == $"dev-backup:{device.Id}");
    }

    // ── Device: FindMyDevice ─────────────────────────────────────────────────

    [Fact]
    public void Device_FindMyDeviceDisabled_GeneratesFindMyItem()
    {
        var device = MakeDevice(findMy: false);

        var items = _sut.Generate([], [device]);

        Assert.Contains(items, i =>
            i.SourceId == $"dev-findmy:{device.Id}" &&
            i.Priority == 2);
    }

    [Fact]
    public void Device_FindMyDeviceEnabled_DoesNotGenerateFindMyItem()
    {
        var device = MakeDevice(findMy: true);

        var items = _sut.Generate([], [device]);

        Assert.DoesNotContain(items, i => i.SourceId == $"dev-findmy:{device.Id}");
    }

    // ── Device: Biometric ────────────────────────────────────────────────────

    [Fact]
    public void Device_BiometricDisabled_GeneratesBiometricItem()
    {
        var device = MakeDevice(biometric: false);

        var items = _sut.Generate([], [device]);

        Assert.Contains(items, i =>
            i.SourceId == $"dev-biometric:{device.Id}" &&
            i.Priority == 3);
    }

    // ── Multiple entities ─────────────────────────────────────────────────────

    [Fact]
    public void NoAccountsOrDevices_ReturnsEmptyList()
    {
        var items = _sut.Generate([], []);

        Assert.Empty(items);
    }

    [Fact]
    public void MultipleAccounts_EachGeneratesOwnItems()
    {
        var acc1 = MakeAccount(twoFactor: TwoFactorStatus.Disabled);
        var acc2 = MakeAccount(twoFactor: TwoFactorStatus.Disabled);

        var items = _sut.Generate([acc1, acc2], []);

        Assert.Contains(items, i => i.SourceId == $"acc-2fa:{acc1.Id}");
        Assert.Contains(items, i => i.SourceId == $"acc-2fa:{acc2.Id}");
    }

    [Fact]
    public void FullySecureAccount_GeneratesNoItems()
    {
        var account = MakeAccount(
            twoFactor: TwoFactorStatus.Enabled,
            recoveryEmail: RecoveryStatus.Set,
            recoveryPhone: RecoveryStatus.Set,
            suspicious: false);

        var items = _sut.Generate([account], []);

        Assert.Empty(items);
    }

    [Fact]
    public void FullySecureDevice_GeneratesNoItems()
    {
        var device = MakeDevice(
            support: SupportStatus.Supported,
            screenLock: true,
            backup: true,
            findMy: true,
            biometric: true);

        var items = _sut.Generate([], [device]);

        Assert.Empty(items);
    }

    [Fact]
    public void ResultIsSortedByPriorityThenTitle()
    {
        var device = MakeDevice(
            screenLock: false, // priority 1
            findMy: false,     // priority 2
            biometric: false); // priority 3

        var items = _sut.Generate([], [device]).ToList();

        var priorities = items.Select(i => i.Priority).ToList();
        Assert.Equal(priorities.OrderBy(p => p).ToList(), priorities);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static Account MakeAccount(
        TwoFactorStatus twoFactor = TwoFactorStatus.Enabled,
        RecoveryStatus recoveryEmail = RecoveryStatus.Set,
        RecoveryStatus recoveryPhone = RecoveryStatus.Set,
        bool suspicious = false)
        => new()
        {
            FamilyId              = Guid.NewGuid(),
            AccountType           = AccountType.Email,
            MaskedIdentifier      = "****@example.com",
            TwoFactorStatus       = twoFactor,
            RecoveryEmailStatus   = recoveryEmail,
            RecoveryPhoneStatus   = recoveryPhone,
            SuspiciousActivityFlag = suspicious,
        };

    private static Device MakeDevice(
        SupportStatus support   = SupportStatus.Supported,
        bool screenLock         = true,
        bool backup             = true,
        bool findMy             = true,
        bool biometric          = true)
        => new()
        {
            FamilyId             = Guid.NewGuid(),
            DeviceType           = DeviceType.Smartphone,
            Brand                = "Apple",
            Model                = "iPhone 15",
            OsName               = "iOS",
            OsVersion            = "17",
            SupportStatus        = support,
            ScreenLockEnabled    = screenLock,
            BackupEnabled        = backup,
            FindMyDeviceEnabled  = findMy,
            BiometricEnabled     = biometric,
        };
}
