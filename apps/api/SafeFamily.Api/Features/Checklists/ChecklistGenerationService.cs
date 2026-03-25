using SafeFamily.Api.Domain.Accounts;
using SafeFamily.Api.Domain.Checklists;
using SafeFamily.Api.Domain.Devices;

namespace SafeFamily.Api.Features.Checklists;

/// <summary>
/// Pure service (no I/O) that inspects account and device metadata and produces
/// a list of actionable checklist items for a family.
///
/// Rules:
///   Account rules — based on TwoFactorStatus, RecoveryStatus, SuspiciousActivityFlag
///   Device rules  — based on SupportStatus, ScreenLockEnabled, BackupEnabled,
///                   FindMyDeviceEnabled, BiometricEnabled
/// </summary>
public class ChecklistGenerationService
{
    public IReadOnlyList<GeneratedChecklistItem> Generate(
        IReadOnlyList<Account> accounts,
        IReadOnlyList<Device> devices)
    {
        var items = new List<GeneratedChecklistItem>();

        foreach (var acc in accounts)
        {
            var label = $"{acc.AccountType} ({acc.MaskedIdentifier})";

            if (acc.TwoFactorStatus == TwoFactorStatus.Disabled)
                items.Add(new GeneratedChecklistItem(
                    Title:       $"Enable two-factor authentication on {label}",
                    Description: "Two-factor authentication (2FA) adds a critical second layer of security. Enable it now to protect this account from unauthorised access.",
                    Category:    ChecklistCategory.AccountSecurity,
                    Priority:    1,
                    SourceType:  ChecklistSourceType.Account,
                    SourceId:    $"acc-2fa:{acc.Id}"));

            if (acc.RecoveryEmailStatus == RecoveryStatus.NotSet)
                items.Add(new GeneratedChecklistItem(
                    Title:       $"Set up a recovery email for {label}",
                    Description: "A recovery email lets you regain access if you're ever locked out. Add one to keep this account recoverable.",
                    Category:    ChecklistCategory.AccountSecurity,
                    Priority:    2,
                    SourceType:  ChecklistSourceType.Account,
                    SourceId:    $"acc-recovery-email:{acc.Id}"));

            if (acc.RecoveryPhoneStatus == RecoveryStatus.NotSet)
                items.Add(new GeneratedChecklistItem(
                    Title:       $"Set up a recovery phone for {label}",
                    Description: "A recovery phone number provides an additional avenue to regain account access. Add one for better account resilience.",
                    Category:    ChecklistCategory.AccountSecurity,
                    Priority:    2,
                    SourceType:  ChecklistSourceType.Account,
                    SourceId:    $"acc-recovery-phone:{acc.Id}"));

            if (acc.SuspiciousActivityFlag)
                items.Add(new GeneratedChecklistItem(
                    Title:       $"Review suspicious activity on {label}",
                    Description: "This account has been flagged for suspicious activity. Review recent logins, change your password, and enable 2FA immediately.",
                    Category:    ChecklistCategory.AccountSecurity,
                    Priority:    1,
                    SourceType:  ChecklistSourceType.Account,
                    SourceId:    $"acc-suspicious:{acc.Id}"));
        }

        foreach (var dev in devices)
        {
            var label = $"{dev.Brand} {dev.Model}".Trim();

            if (dev.SupportStatus == SupportStatus.EndOfLife)
                items.Add(new GeneratedChecklistItem(
                    Title:       $"Replace end-of-life device: {label}",
                    Description: $"This device ({dev.OsName} {dev.OsVersion}) is no longer receiving security updates. Replace it to eliminate critical vulnerabilities.",
                    Category:    ChecklistCategory.DeviceHygiene,
                    Priority:    1,
                    SourceType:  ChecklistSourceType.Device,
                    SourceId:    $"dev-eol:{dev.Id}"));

            if (dev.SupportStatus == SupportStatus.NoLongerReceivingUpdates)
                items.Add(new GeneratedChecklistItem(
                    Title:       $"Update or replace device no longer receiving updates: {label}",
                    Description: $"This device ({dev.OsName} {dev.OsVersion}) has stopped receiving security patches. Upgrade the OS or replace the device.",
                    Category:    ChecklistCategory.DeviceHygiene,
                    Priority:    1,
                    SourceType:  ChecklistSourceType.Device,
                    SourceId:    $"dev-no-updates:{dev.Id}"));

            if (!dev.ScreenLockEnabled)
                items.Add(new GeneratedChecklistItem(
                    Title:       $"Enable screen lock on {label}",
                    Description: "A screen lock (PIN, password, or biometric) prevents unauthorised access if your device is lost or stolen.",
                    Category:    ChecklistCategory.DeviceHygiene,
                    Priority:    1,
                    SourceType:  ChecklistSourceType.Device,
                    SourceId:    $"dev-screenlock:{dev.Id}"));

            if (!dev.BackupEnabled)
                items.Add(new GeneratedChecklistItem(
                    Title:       $"Enable cloud backup on {label}",
                    Description: "Regular backups ensure your data can be recovered after loss, theft, or hardware failure. Enable automatic cloud backup now.",
                    Category:    ChecklistCategory.BackupRecovery,
                    Priority:    1,
                    SourceType:  ChecklistSourceType.Device,
                    SourceId:    $"dev-backup:{dev.Id}"));

            if (!dev.FindMyDeviceEnabled)
                items.Add(new GeneratedChecklistItem(
                    Title:       $"Enable Find My Device on {label}",
                    Description: "Find My Device lets you locate, lock, or remotely wipe a lost or stolen device. Enable it to protect your data.",
                    Category:    ChecklistCategory.DeviceHygiene,
                    Priority:    2,
                    SourceType:  ChecklistSourceType.Device,
                    SourceId:    $"dev-findmy:{dev.Id}"));

            if (!dev.BiometricEnabled)
                items.Add(new GeneratedChecklistItem(
                    Title:       $"Enable biometric authentication on {label}",
                    Description: "Biometric authentication (fingerprint or face recognition) provides quick and secure access to your device.",
                    Category:    ChecklistCategory.DeviceHygiene,
                    Priority:    3,
                    SourceType:  ChecklistSourceType.Device,
                    SourceId:    $"dev-biometric:{dev.Id}"));
        }

        return items.OrderBy(i => i.Priority).ThenBy(i => i.Title).ToList();
    }
}
