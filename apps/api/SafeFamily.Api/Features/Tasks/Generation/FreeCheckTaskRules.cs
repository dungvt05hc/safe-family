using SafeFamily.Api.Domain.Accounts;
using SafeFamily.Api.Domain.Devices;
using SafeFamily.Api.Domain.Tasks;
using SafeFamily.Api.Features.Fulfillment;

namespace SafeFamily.Api.Features.Tasks.Generation;

/// <summary>
/// Rule definitions and top-3 selection logic for the Free Safety Check (FREE-CHECK) package.
///
/// <para>
/// <b>Selection strategy</b><br/>
/// The free tier is designed to be beginner-friendly: no more than 3 tasks, high-impact
/// quick wins, clearly worded.  The engine evaluates a prioritised set of protection-gap
/// rules against the family's accounts and devices, scoring each triggered rule by a
/// pre-assigned weight.  The top 3 by weight are returned.
/// </para>
///
/// <para>
/// <b>Deduplication</b><br/>
/// Account- and device-targeted rules use <see cref="GenerationKeyStrategy"/> keys tied to
/// the specific entity ID (e.g. <c>task:account:enable_2fa:{accountId}</c>).  This means
/// if system rule reconciliation has already created an identical task for the family, the
/// generation engine will refresh or skip rather than create a duplicate.
/// </para>
///
/// <para>
/// <b>Fallback rules</b><br/>
/// When fewer than 3 data-driven rules fire (e.g. complete family data is not yet recorded),
/// generic booking-keyed fallback specs fill the remaining slots.  These are always relevant
/// for free-tier users regardless of their device or account data.
/// </para>
/// </summary>
internal static class FreeCheckTaskRules
{
    private const int MaxTasks = 3;

    // ── Rule weights ──────────────────────────────────────────────────────────
    // Higher = higher selection priority.  Assessment score boosts (+5) are applied
    // at evaluation time to push data-backed rules above generic fallbacks.

    private const int WeightSuspiciousActivity = 95;
    private const int WeightEmailNo2Fa         = 90;
    private const int WeightBankingNo2Fa       = 85;
    private const int WeightNoScreenLock       = 80;
    private const int WeightNoBackup           = 75;
    private const int WeightDeviceEndOfLife    = 60;
    private const int WeightNoRecoveryEmail    = 55;
    // Fallback rules use weights below all data-driven rules so they are only
    // selected when fewer than MaxTasks data-driven candidates fired.
    private const int WeightFallbackBreachCheck   = 45;
    private const int WeightFallbackConnectedApps = 40;

    /// <summary>
    /// Evaluates protection-gap rules against family data and returns up to
    /// <c>3</c> <see cref="TaskGenerationSpec"/> instances ordered from most
    /// to least critical.
    ///
    /// <b>Rule evaluation order</b> (highest weight wins if more than 3 fire):
    /// <list type="number">
    ///   <item>Suspicious activity detected on any account (+boost if low account score)</item>
    ///   <item>No 2FA on a primary email account (+boost if low account score)</item>
    ///   <item>No 2FA on a banking account (+boost if low account score)</item>
    ///   <item>No screen lock on any device (+boost if low device score)</item>
    ///   <item>No automatic backup on any device (+boost if low backup score)</item>
    ///   <item>Device is end-of-life / no longer receiving security updates</item>
    ///   <item>No recovery email on any email account</item>
    ///   <item>Fallback: check credentials on haveibeenpwned.com</item>
    ///   <item>Fallback: review connected app permissions</item>
    /// </list>
    /// </summary>
    public static IReadOnlyList<TaskGenerationSpec> SelectTopSpecs(
        FulfillmentContext context, Guid bookingId)
    {
        var familyId   = context.Booking.FamilyId;
        var assessment = context.LatestAssessment;
        var accounts   = context.Accounts;
        var devices    = context.Devices;
        var sourceId   = bookingId.ToString("N");

        // Assessment boost: add +5 to data-backed rules when the relevant score
        // is below 50, ensuring they beat generic fallbacks even more decisively.
        int AccountBoost() => (assessment?.AccountSecurityScore ?? 100) < 50 ? 5 : 0;
        int DeviceBoost()  => (assessment?.DeviceHygieneScore   ?? 100) < 50 ? 5 : 0;
        int BackupBoost()  => (assessment?.BackupRecoveryScore  ?? 100) < 50 ? 5 : 0;

        var candidates = new List<(int Weight, TaskGenerationSpec Spec)>();

        // ── Rule 1: Suspicious activity — sign out all sessions immediately ───
        // Pick the highest-priority account type that has a suspicious activity flag.
        var suspicious = accounts
            .Where(a => a.SuspiciousActivityFlag)
            .OrderBy(AccountTypePriority)
            .FirstOrDefault();

        if (suspicious is not null)
            candidates.Add((WeightSuspiciousActivity + AccountBoost(), new TaskGenerationSpec
            {
                GenerationKey    = GenerationKeyStrategy.AccountSignOutAllSessions(suspicious.Id),
                SourceType       = TaskSourceType.FreeCheck,
                SourceId         = sourceId,
                FamilyId         = familyId,
                TargetType       = TaskTargetType.Account,
                TargetId         = suspicious.Id,
                TargetLabel      = suspicious.MaskedIdentifier,
                Title            = $"Sign out of all sessions on {suspicious.MaskedIdentifier}",
                Description      = "Suspicious activity has been flagged on this account. " +
                                   "Sign out of all active sessions now to cut off any unauthorised access.",
                WhyThisMatters   = "If an attacker is already logged into your account, signing out all " +
                                   "sessions is the fastest way to revoke their access before changing your password.",
                GuidanceMarkdown = "1. Open the **Security** settings on your account\n" +
                                   "2. Find **Active sessions** or **Where you're signed in**\n" +
                                   "3. Tap **Sign out of all other sessions** (or similar)\n" +
                                   "4. Immediately change your password after signing out",
                Category         = TaskCategory.AccountSecurity,
                Priority         = TaskPriority.High,
                Phase            = TaskPhase.Immediate,
                SortOrder        = 1,
            }));

        // ── Rule 2: No 2FA on email — the master key to all other accounts ────
        // Email recovery access means a compromised email = all other accounts at risk.
        var emailNo2Fa = accounts
            .Where(a => a.AccountType == AccountType.Email
                     && a.TwoFactorStatus != TwoFactorStatus.Enabled)
            .OrderBy(AccountTypePriority)
            .FirstOrDefault();

        if (emailNo2Fa is not null)
            candidates.Add((WeightEmailNo2Fa + AccountBoost(), new TaskGenerationSpec
            {
                GenerationKey    = GenerationKeyStrategy.AccountEnable2Fa(emailNo2Fa.Id),
                SourceType       = TaskSourceType.FreeCheck,
                SourceId         = sourceId,
                FamilyId         = familyId,
                TargetType       = TaskTargetType.Account,
                TargetId         = emailNo2Fa.Id,
                TargetLabel      = emailNo2Fa.MaskedIdentifier,
                Title            = $"Turn on two-factor authentication for {emailNo2Fa.MaskedIdentifier}",
                Description      = "Two-factor authentication (2FA) adds a second verification step when you sign in, " +
                                   "making it much harder for attackers to take over your account even if they know your password.",
                WhyThisMatters   = "Your email account is the recovery point for almost every service you use. " +
                                   "If it's compromised, an attacker can reset passwords on your bank, social media, and shopping accounts.",
                GuidanceMarkdown = "1. Open your email provider's **Security settings**\n" +
                                   "2. Look for **Two-step verification** or **2-Factor authentication**\n" +
                                   "3. Choose an **authenticator app** (Google Authenticator, Microsoft Authenticator) over SMS where possible\n" +
                                   "4. Save your **backup codes** somewhere safe offline",
                HelpLink         = "https://support.google.com/accounts/answer/185839",
                Category         = TaskCategory.AccountSecurity,
                Priority         = TaskPriority.High,
                Phase            = TaskPhase.Immediate,
                SortOrder        = 2,
            }));

        // ── Rule 3: No 2FA on a banking account ───────────────────────────────
        var bankNo2Fa = accounts
            .Where(a => a.AccountType == AccountType.Banking
                     && a.TwoFactorStatus != TwoFactorStatus.Enabled)
            .FirstOrDefault();

        if (bankNo2Fa is not null)
            candidates.Add((WeightBankingNo2Fa + AccountBoost(), new TaskGenerationSpec
            {
                GenerationKey    = GenerationKeyStrategy.AccountEnable2Fa(bankNo2Fa.Id),
                SourceType       = TaskSourceType.FreeCheck,
                SourceId         = sourceId,
                FamilyId         = familyId,
                TargetType       = TaskTargetType.Account,
                TargetId         = bankNo2Fa.Id,
                TargetLabel      = bankNo2Fa.MaskedIdentifier,
                Title            = $"Enable two-factor authentication on {bankNo2Fa.MaskedIdentifier}",
                Description      = "Your bank account does not have a second sign-in step. " +
                                   "Enabling 2FA makes it significantly harder for attackers to access your funds.",
                WhyThisMatters   = "Banking accounts are the highest-value target for fraud. " +
                                   "A second factor stops most automated credential-stuffing attacks instantly.",
                Category         = TaskCategory.AccountSecurity,
                Priority         = TaskPriority.High,
                Phase            = TaskPhase.Next7Days,
                SortOrder        = 3,
            }));

        // ── Rule 4: No screen lock on any device ──────────────────────────────
        // Pick the first device without a screen lock.
        var noScreenLock = devices
            .Where(d => !d.ScreenLockEnabled)
            .FirstOrDefault();

        if (noScreenLock is not null)
            candidates.Add((WeightNoScreenLock + DeviceBoost(), new TaskGenerationSpec
            {
                GenerationKey    = GenerationKeyStrategy.DeviceEnableScreenLock(noScreenLock.Id),
                SourceType       = TaskSourceType.FreeCheck,
                SourceId         = sourceId,
                FamilyId         = familyId,
                TargetType       = TaskTargetType.Device,
                TargetId         = noScreenLock.Id,
                TargetLabel      = DeviceLabel(noScreenLock),
                Title            = $"Set up a screen lock on {DeviceLabel(noScreenLock)}",
                Description      = "This device has no PIN, password, or biometric lock. " +
                                   "Anyone who picks it up can access your accounts and data immediately.",
                WhyThisMatters   = "A screen lock is the simplest physical barrier against unauthorised access. " +
                                   "It takes under a minute to set up and protects everything stored on the device.",
                GuidanceMarkdown = "1. Go to **Settings → Security** (Android) or **Settings → Face ID & Passcode** (iPhone)\n" +
                                   "2. Set a PIN, password, or enable Face ID / fingerprint\n" +
                                   "3. Set the screen to lock after **30 seconds** of inactivity",
                Category         = TaskCategory.DeviceHygiene,
                Priority         = TaskPriority.High,
                Phase            = TaskPhase.Immediate,
                SortOrder        = 4,
            }));

        // ── Rule 5: No automatic backup on any device ─────────────────────────
        var noBackup = devices
            .Where(d => !d.BackupEnabled)
            .FirstOrDefault();

        if (noBackup is not null)
            candidates.Add((WeightNoBackup + BackupBoost(), new TaskGenerationSpec
            {
                GenerationKey    = GenerationKeyStrategy.DeviceEnableBackup(noBackup.Id),
                SourceType       = TaskSourceType.FreeCheck,
                SourceId         = sourceId,
                FamilyId         = familyId,
                TargetType       = TaskTargetType.Device,
                TargetId         = noBackup.Id,
                TargetLabel      = DeviceLabel(noBackup),
                Title            = $"Turn on automatic backups for {DeviceLabel(noBackup)}",
                Description      = "Automatic backups protect your photos, contacts, and files from loss " +
                                   "due to theft, hardware failure, or accidental deletion.",
                WhyThisMatters   = "Without a backup, a lost or broken device means permanently losing everything on it. " +
                                   "iCloud and Google One backups are free for a reasonable amount of data.",
                GuidanceMarkdown = "**iPhone**: Settings → [Your Name] → iCloud → iCloud Backup → turn on **Back Up This iPhone**\n\n" +
                                   "**Android**: Settings → Google → Backup → turn on **Back up to Google Drive**",
                Category         = TaskCategory.BackupRecovery,
                Priority         = TaskPriority.Medium,
                Phase            = TaskPhase.Next7Days,
                SortOrder        = 5,
            }));

        // ── Rule 6: Device end-of-life / no longer receiving security updates ─
        var eolDevice = devices
            .Where(d => d.SupportStatus is SupportStatus.EndOfLife
                                        or SupportStatus.NoLongerReceivingUpdates)
            .FirstOrDefault();

        if (eolDevice is not null)
            candidates.Add((WeightDeviceEndOfLife + DeviceBoost(), new TaskGenerationSpec
            {
                GenerationKey    = GenerationKeyStrategy.DeviceInstallSecurityPatches(eolDevice.Id),
                SourceType       = TaskSourceType.FreeCheck,
                SourceId         = sourceId,
                FamilyId         = familyId,
                TargetType       = TaskTargetType.Device,
                TargetId         = eolDevice.Id,
                TargetLabel      = DeviceLabel(eolDevice),
                Title            = $"Review security options for your unsupported device: {DeviceLabel(eolDevice)}",
                Description      = "This device no longer receives security patches from its manufacturer, " +
                                   "leaving it exposed to known vulnerabilities that can never be fixed via update.",
                WhyThisMatters   = "Unpatched devices are a common entry point for malware. " +
                                   "Limiting what you do on this device (no banking, no email) reduces your exposure " +
                                   "while you plan to replace or retire it.",
                Category         = TaskCategory.DeviceHygiene,
                Priority         = TaskPriority.Medium,
                Phase            = TaskPhase.Next30Days,
                SortOrder        = 6,
            }));

        // ── Rule 7: No recovery email on a primary email account ─────────────
        var noRecovery = accounts
            .Where(a => a.AccountType == AccountType.Email
                     && a.RecoveryEmailStatus != RecoveryStatus.Set)
            .FirstOrDefault();

        if (noRecovery is not null)
            candidates.Add((WeightNoRecoveryEmail + AccountBoost(), new TaskGenerationSpec
            {
                GenerationKey    = GenerationKeyStrategy.AccountAddRecoveryEmail(noRecovery.Id),
                SourceType       = TaskSourceType.FreeCheck,
                SourceId         = sourceId,
                FamilyId         = familyId,
                TargetType       = TaskTargetType.Account,
                TargetId         = noRecovery.Id,
                TargetLabel      = noRecovery.MaskedIdentifier,
                Title            = $"Add a recovery email to {noRecovery.MaskedIdentifier}",
                Description      = "Without a recovery address, you could permanently lose access to this account " +
                                   "if you forget your password or lose your phone.",
                WhyThisMatters   = "A recovery email gives you a trusted fallback to regain access — " +
                                   "without it, account recovery depends entirely on phone support or security questions.",
                Category         = TaskCategory.AccountSecurity,
                Priority         = TaskPriority.Medium,
                Phase            = TaskPhase.Next30Days,
                SortOrder        = 7,
            }));

        // ── Select top MaxTasks by weight, dedup by GenerationKey ─────────────
        // DistinctBy preserves the first (highest-weight) entry for each key,
        // which matters when two rules both produce a key for the same account
        // (e.g. billing No2FA and email No2FA pointing to the same account ID).
        var selected = candidates
            .OrderByDescending(c => c.Weight)
            .DistinctBy(c => c.Spec.GenerationKey)
            .Take(MaxTasks)
            .Select(c => c.Spec)
            .ToList();

        // ── Fill remaining slots with always-relevant fallback tasks ──────────
        FillFallbacks(selected, familyId, bookingId, sourceId);

        return selected;
    }

    // ── Fallback rules ────────────────────────────────────────────────────────

    /// <summary>
    /// Appends generic, booking-keyed tasks until <see cref="MaxTasks"/> is reached.
    /// These are relevant to all families regardless of their data completeness.
    /// Booking-keyed keys ensure a fresh task per booking (not deduplicated across bookings),
    /// since they are not tied to a specific account or device entity.
    /// </summary>
    private static void FillFallbacks(
        List<TaskGenerationSpec> selected,
        Guid familyId,
        Guid bookingId,
        string sourceId)
    {
        // Fallback slot indices start at 10 to avoid collision with GenerationKeyStrategy.BookingTask
        // indices used by the fixed checklist items in FreeCheckHandler (which use indices 1–3).
        var fallbackIndex = 10;

        // F1: Credential breach check — universally valuable, beginner-friendly
        if (selected.Count < MaxTasks)
            selected.Add(new TaskGenerationSpec
            {
                GenerationKey    = GenerationKeyStrategy.BookingTask(GenerationKeyStrategy.ProductSlugFreeCheck, bookingId, fallbackIndex++),
                SourceType       = TaskSourceType.FreeCheck,
                SourceId         = sourceId,
                FamilyId         = familyId,
                TargetType       = TaskTargetType.Family,
                Title            = "Check whether your email addresses have been exposed in a data breach",
                Description      = "Visit haveibeenpwned.com and enter each family email address. " +
                                   "The site shows you which breaches contain your credentials so you know which passwords to change first.",
                WhyThisMatters   = "Breached passwords are sold in bulk online. Attackers try them against every known account. " +
                                   "Knowing which accounts are affected lets you act before attackers do.",
                HelpLink         = "https://haveibeenpwned.com",
                Category         = TaskCategory.AccountSecurity,
                Priority         = TaskPriority.High,
                Phase            = TaskPhase.Next7Days,
                SortOrder        = 8,
            });

        // F2: Connected app review — easy win, high privacy impact
        if (selected.Count < MaxTasks)
            selected.Add(new TaskGenerationSpec
            {
                GenerationKey    = GenerationKeyStrategy.BookingTask(GenerationKeyStrategy.ProductSlugFreeCheck, bookingId, fallbackIndex),
                SourceType       = TaskSourceType.FreeCheck,
                SourceId         = sourceId,
                FamilyId         = familyId,
                TargetType       = TaskTargetType.Family,
                Title            = "Review which apps have access to your Google or Apple account",
                Description      = "Open your Google or Apple account security settings and revoke access for any " +
                                   "third-party app you no longer use or don't recognise.",
                WhyThisMatters   = "Apps you granted access years ago may still be reading your emails, contacts, or calendar. " +
                                   "Revoking unused apps closes silent back-doors to your data.",
                GuidanceMarkdown = "**Google**: [myaccount.google.com/permissions](https://myaccount.google.com/permissions)\n\n" +
                                   "**Apple**: Settings → [Your Name] → Password & Security → Apps Using Apple ID",
                Category         = TaskCategory.PrivacySharing,
                Priority         = TaskPriority.Medium,
                Phase            = TaskPhase.Next7Days,
                SortOrder        = 9,
            });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Determines which account types should be prioritised for security-critical rules.
    /// Lower return value = higher priority.
    /// </summary>
    private static int AccountTypePriority(Account a) => a.AccountType switch
    {
        AccountType.Email      => 0,
        AccountType.Banking    => 1,
        AccountType.Work       => 2,
        AccountType.Government => 3,
        AccountType.Healthcare => 4,
        AccountType.SocialMedia => 5,
        _ => 99,
    };

    /// <summary>
    /// Best-effort human-readable label for a device.
    /// Uses the legacy Brand/Model fields when populated; falls back to a generic label.
    /// The <c>[Obsolete]</c> suppression is intentional: catalog nav properties require
    /// an Include() that is not performed in the fulfillment context query, so the legacy
    /// fields are the only available source of display text at this point.
    /// </summary>
#pragma warning disable CS0618
    private static string DeviceLabel(Device d)
    {
        var parts = new[] { d.Brand?.Trim(), d.Model?.Trim() }
            .Where(p => !string.IsNullOrWhiteSpace(p));

        return string.Join(" ", parts) is { Length: > 0 } label
            ? label
            : "your device";
    }
#pragma warning restore CS0618
}
