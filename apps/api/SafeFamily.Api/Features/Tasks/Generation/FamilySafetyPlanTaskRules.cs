using SafeFamily.Api.Domain.Accounts;
using SafeFamily.Api.Domain.Devices;
using SafeFamily.Api.Domain.Families;
using SafeFamily.Api.Domain.Tasks;
using SafeFamily.Api.Features.Fulfillment;

namespace SafeFamily.Api.Features.Tasks.Generation;

/// <summary>
/// Rule definitions and full-coverage selection logic for the Family Safety Plan
/// (FAMILY-CORE) package.
///
/// <para>
/// <b>Selection strategy</b><br/>
/// Unlike the free tier, the premium plan generates <em>all applicable tasks</em> —
/// there is no artificial cap.  Every fired rule produces a spec, grouped into four
/// categories: assessment-driven top priorities, account-based gaps, device-based gaps,
/// and member-based actions.
/// </para>
///
/// <para>
/// <b>Deduplication</b><br/>
/// Account- and device-targeted rules use <see cref="GenerationKeyStrategy"/> keys tied
/// to the specific entity ID.  Member-level keys use <c>Custom</c> slugs.  The generation
/// engine handles idempotency — re-running on the same data refreshes rather than duplicates.
/// </para>
///
/// <para>
/// <b>Fallbacks</b><br/>
/// Two booking-level fallback tasks are always emitted when account / device data is sparse,
/// ensuring every plan delivery has actionable items.
/// </para>
/// </summary>
internal static class FamilySafetyPlanTaskRules
{
    private const string Slug     = GenerationKeyStrategy.ProductSlugFamilySafetyPlan;
    private const int    ScoreLow = 60; // below this, fire member-level scam task

    public static IReadOnlyList<TaskGenerationSpec> SelectSpecs(
        FulfillmentContext context, Guid bookingId)
    {
        var familyId   = context.Booking.FamilyId;
        var assessment = context.LatestAssessment;
        var accounts   = context.Accounts;
        var devices    = context.Devices;
        var persons    = context.FamilyPersons;
        var sourceId   = bookingId.ToString("N");

        var specs = new List<TaskGenerationSpec>();

        // ════════════════════════════════════════════════════════════════════
        // GROUP 1 — Assessment-driven top priorities
        // ════════════════════════════════════════════════════════════════════

        if (assessment is not null)
        {
            // Weakest scoring category drives an immediate remediation task.
            var categories = new[]
            {
                (assessment.AccountSecurityScore, TaskCategory.AccountSecurity,
                    "account-security",
                    "Accounts — Improve Account Security Score",
                    "Your family's account security score is below target. " +
                    "Review all accounts for missing 2FA, weak passwords, and unreviewed permissions.",
                    "Enable two-factor authentication, use a password manager, and revoke stale app access " +
                    "to raise your account security score above 75.",
                    "1. Audit every account listed under **Accounts**\n" +
                    "2. Enable 2FA on any account that shows it as disabled\n" +
                    "3. Replace weak or reused passwords using a password manager\n" +
                    "4. Remove third-party app connections you no longer recognise",
                    TaskPriority.High, TaskPhase.Immediate),

                (assessment.DeviceHygieneScore, TaskCategory.DeviceHygiene,
                    "device-hygiene",
                    "Devices — Improve Device Hygiene Score",
                    "One or more of your family's devices has a hygiene gap that needs attention. " +
                    "Screen lock, encryption, and up-to-date software are the baseline.",
                    "Ensure every device has a screen lock, is running the latest OS, and has " +
                    "encryption enabled to reach a device hygiene score above 75.",
                    "1. Go to **Settings → Security** on each device\n" +
                    "2. Enable screen lock (PIN, fingerprint, or face ID)\n" +
                    "3. Install pending OS and app updates\n" +
                    "4. Enable full-disk encryption (FileVault / BitLocker / device encryption)",
                    TaskPriority.High, TaskPhase.Immediate),

                (assessment.BackupRecoveryScore, TaskCategory.BackupRecovery,
                    "backup-recovery",
                    "Backup — Set Up Automated Backups",
                    "Your backup and recovery score indicates that critical data may not be protected " +
                    "against device loss, theft, or ransomware.",
                    "Enable automated cloud backups on every device and confirm at least one recovery " +
                    "contact is set on critical accounts.",
                    "**iPhone**: Settings → [Your Name] → iCloud → iCloud Backup → **Back Up This iPhone**\n\n" +
                    "**Android**: Settings → Google → Backup → **Back up to Google Drive**\n\n" +
                    "**Laptop**: Enable Time Machine (macOS) or File History (Windows)",
                    TaskPriority.Medium, TaskPhase.Next7Days),

                (assessment.PrivacySharingScore, TaskCategory.PrivacySharing,
                    "privacy-sharing",
                    "Privacy — Review App Permissions and Social Settings",
                    "Your privacy score suggests apps or social platforms may have more access " +
                    "to your family's data than necessary.",
                    "Audit permissions for location, camera, and microphone on every device, " +
                    "and review privacy visibility settings on social media accounts.",
                    "1. **iOS**: Settings → Privacy & Security → review each permission category\n" +
                    "2. **Android**: Settings → Privacy → Permission manager\n" +
                    "3. For each social platform: go to **Settings → Privacy** and restrict who can see your profile, posts, and contact info",
                    TaskPriority.Medium, TaskPhase.Next30Days),

                (assessment.ScamReadinessScore, TaskCategory.ScamReadiness,
                    "scam-readiness",
                    "Scam Readiness — Complete Family Awareness Exercise",
                    "Your scam readiness score is below target. Review common scam tactics " +
                    "with every family member to build household-wide awareness.",
                    "Practising scam recognition as a family is one of the most effective defences " +
                    "against social engineering. Discuss phishing, smishing, and impersonation scams together.",
                    "1. Review the three most common scam types: **phishing email**, **fake tech support**, **urgent payment request**\n" +
                    "2. Show family members how to identify suspicious sender addresses and links\n" +
                    "3. Agree on a family code word to verify urgent money requests by phone\n" +
                    "4. Register household numbers with the Do Not Call registry",
                    TaskPriority.Medium, TaskPhase.Next30Days),
            };

            // Emit a task for each category that is below the risk threshold (< 75).
            // The lowest-scoring category gets priority Critical; others get the spec default.
            var lowestScore = categories.Min(c => c.Item1);

            foreach (var (score, category, slug, title, description, whyThisMatters, guidance, priority, phase) in categories)
            {
                if (score >= 75) continue;

                var effectivePriority = score == lowestScore ? TaskPriority.High : priority;
                var effectivePhase    = score == lowestScore ? TaskPhase.Immediate : phase;

                specs.Add(new TaskGenerationSpec
                {
                    GenerationKey    = GenerationKeyStrategy.BookingTask(Slug, bookingId, specs.Count + 1),
                    SourceType       = TaskSourceType.FamilySafetyPlan,
                    SourceId         = sourceId,
                    FamilyId         = familyId,
                    TargetType       = TaskTargetType.Family,
                    Title            = title,
                    Description      = description,
                    WhyThisMatters   = whyThisMatters,
                    GuidanceMarkdown = guidance,
                    Category         = category,
                    Priority         = effectivePriority,
                    Phase            = effectivePhase,
                    SortOrder        = specs.Count + 1,
                });
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // GROUP 2 — Account-based rules (one spec per account that fires)
        // ════════════════════════════════════════════════════════════════════

        foreach (var account in accounts.OrderBy(AccountTypePriority))
        {
            // Rule A: Suspicious activity → sign out all sessions immediately.
            if (account.SuspiciousActivityFlag)
                specs.Add(new TaskGenerationSpec
                {
                    GenerationKey    = GenerationKeyStrategy.AccountSignOutAllSessions(account.Id),
                    SourceType       = TaskSourceType.FamilySafetyPlan,
                    SourceId         = sourceId,
                    FamilyId         = familyId,
                    TargetType       = TaskTargetType.Account,
                    TargetId         = account.Id,
                    TargetLabel      = account.MaskedIdentifier,
                    Title            = $"Sign out of all sessions — {account.MaskedIdentifier}",
                    Description      = "Suspicious activity has been detected on this account. " +
                                       "Sign out of all active sessions immediately to cut off any unauthorised access, " +
                                       "then change your password.",
                    WhyThisMatters   = "If an attacker is already logged in, revoking all sessions is the " +
                                       "fastest way to stop them before you secure the account.",
                    GuidanceMarkdown = "1. Open **Security settings** on this account\n" +
                                       "2. Find **Active sessions** / **Where you're signed in**\n" +
                                       "3. Select **Sign out of all other sessions**\n" +
                                       "4. Immediately change your password\n" +
                                       "5. Enable 2FA if not already active",
                    Category         = TaskCategory.AccountSecurity,
                    Priority         = TaskPriority.High,
                    Phase            = TaskPhase.Immediate,
                    SortOrder        = specs.Count + 1,
                });

            // Rule B: 2FA not enabled — phase depends on account importance.
            if (account.TwoFactorStatus != TwoFactorStatus.Enabled)
            {
                var isCritical = account.AccountType is AccountType.Email or AccountType.Banking;
                specs.Add(new TaskGenerationSpec
                {
                    GenerationKey    = GenerationKeyStrategy.AccountEnable2Fa(account.Id),
                    SourceType       = TaskSourceType.FamilySafetyPlan,
                    SourceId         = sourceId,
                    FamilyId         = familyId,
                    TargetType       = TaskTargetType.Account,
                    TargetId         = account.Id,
                    TargetLabel      = account.MaskedIdentifier,
                    Title            = $"Enable two-factor authentication — {account.MaskedIdentifier}",
                    Description      = "Two-factor authentication adds a second sign-in step, " +
                                       "making it significantly harder for attackers to take over this account " +
                                       "even if your password is stolen.",
                    WhyThisMatters   = account.AccountType == AccountType.Email
                        ? "Your email is the recovery point for almost every other service. " +
                          "If it's compromised, an attacker can reset your bank, social media, and cloud accounts."
                        : account.AccountType == AccountType.Banking
                        ? "Banking accounts are the highest-value target for fraud. " +
                          "2FA stops most automated credential-stuffing attacks instantly."
                        : "2FA protects against password theft, phishing, and data-breach credential reuse.",
                    GuidanceMarkdown = "1. Go to **Settings → Security** on this account\n" +
                                       "2. Find **Two-factor authentication** or **Two-step verification**\n" +
                                       "3. Choose an **authenticator app** over SMS where possible\n" +
                                       "4. Save your **backup codes** in a safe offline location",
                    HelpLink         = account.AccountType == AccountType.Email
                        ? "https://support.google.com/accounts/answer/185839"
                        : null,
                    Category         = TaskCategory.AccountSecurity,
                    Priority         = isCritical ? TaskPriority.High : TaskPriority.Medium,
                    Phase            = isCritical ? TaskPhase.Immediate : TaskPhase.Next7Days,
                    SortOrder        = specs.Count + 1,
                });
            }

            // Rule C: No recovery email on the account.
            if (account.RecoveryEmailStatus != RecoveryStatus.Set)
                specs.Add(new TaskGenerationSpec
                {
                    GenerationKey    = GenerationKeyStrategy.AccountAddRecoveryEmail(account.Id),
                    SourceType       = TaskSourceType.FamilySafetyPlan,
                    SourceId         = sourceId,
                    FamilyId         = familyId,
                    TargetType       = TaskTargetType.Account,
                    TargetId         = account.Id,
                    TargetLabel      = account.MaskedIdentifier,
                    Title            = $"Add recovery email — {account.MaskedIdentifier}",
                    Description      = "Without a recovery address you risk permanently losing access to this account " +
                                       "if you forget your password or lose your 2FA device.",
                    WhyThisMatters   = "A recovery email gives you a trusted fallback to regain access — " +
                                       "without it, account recovery depends entirely on support tickets or security questions that attackers can often answer.",
                    GuidanceMarkdown = "1. Open **Security settings** on this account\n" +
                                       "2. Look for **Recovery options** or **Account recovery**\n" +
                                       "3. Add a recovery email address you control\n" +
                                       "4. Verify the address by clicking the confirmation link",
                    Category         = TaskCategory.AccountSecurity,
                    Priority         = TaskPriority.Medium,
                    Phase            = TaskPhase.Next30Days,
                    SortOrder        = specs.Count + 1,
                });

            // Rule D: No recovery phone on the account.
            if (account.RecoveryPhoneStatus != RecoveryStatus.Set)
                specs.Add(new TaskGenerationSpec
                {
                    GenerationKey    = GenerationKeyStrategy.Custom("account", "add_recovery_phone", account.Id.ToString("N")),
                    SourceType       = TaskSourceType.FamilySafetyPlan,
                    SourceId         = sourceId,
                    FamilyId         = familyId,
                    TargetType       = TaskTargetType.Account,
                    TargetId         = account.Id,
                    TargetLabel      = account.MaskedIdentifier,
                    Title            = $"Add recovery phone number — {account.MaskedIdentifier}",
                    Description      = "Adding a phone number as a recovery option gives you an additional " +
                                       "fallback to recover access if you're ever locked out.",
                    WhyThisMatters   = "A recovery phone allows instant account recovery via SMS code, " +
                                       "reducing the risk of permanent lock-out.",
                    GuidanceMarkdown = "1. Open **Security settings** on this account\n" +
                                       "2. Find **Recovery options** or **Two-step verification**\n" +
                                       "3. Add your mobile number and verify it",
                    Category         = TaskCategory.AccountSecurity,
                    Priority         = TaskPriority.Low,
                    Phase            = TaskPhase.Next30Days,
                    SortOrder        = specs.Count + 1,
                });
        }

        // ════════════════════════════════════════════════════════════════════
        // GROUP 3 — Device-based rules (one spec per device that fires)
        // ════════════════════════════════════════════════════════════════════

#pragma warning disable CS0618 // DeviceLabel uses obsolete Brand/Model fields intentionally
        foreach (var device in devices)
        {
            // Rule A: No screen lock.
            if (!device.ScreenLockEnabled)
                specs.Add(new TaskGenerationSpec
                {
                    GenerationKey    = GenerationKeyStrategy.DeviceEnableScreenLock(device.Id),
                    SourceType       = TaskSourceType.FamilySafetyPlan,
                    SourceId         = sourceId,
                    FamilyId         = familyId,
                    TargetType       = TaskTargetType.Device,
                    TargetId         = device.Id,
                    TargetLabel      = DeviceLabel(device),
                    Title            = $"Enable screen lock — {DeviceLabel(device)}",
                    Description      = "This device has no PIN, password, or biometric lock. " +
                                       "Anyone who picks it up gains instant access to your accounts and personal data.",
                    WhyThisMatters   = "A screen lock is the single most effective physical barrier against " +
                                       "unauthorised access. It takes under a minute to configure.",
                    GuidanceMarkdown = "**iPhone/iPad**: Settings → Face ID & Passcode → Turn Passcode On\n\n" +
                                       "**Android**: Settings → Security → Screen lock → choose PIN or Fingerprint\n\n" +
                                       "**Mac**: System Settings → Lock Screen → set to lock after 1 minute\n\n" +
                                       "**Windows**: Settings → Accounts → Sign-in options → set PIN",
                    Category         = TaskCategory.DeviceHygiene,
                    Priority         = TaskPriority.High,
                    Phase            = TaskPhase.Immediate,
                    SortOrder        = specs.Count + 1,
                });

            // Rule B: No backup enabled.
            if (!device.BackupEnabled)
                specs.Add(new TaskGenerationSpec
                {
                    GenerationKey    = GenerationKeyStrategy.DeviceEnableBackup(device.Id),
                    SourceType       = TaskSourceType.FamilySafetyPlan,
                    SourceId         = sourceId,
                    FamilyId         = familyId,
                    TargetType       = TaskTargetType.Device,
                    TargetId         = device.Id,
                    TargetLabel      = DeviceLabel(device),
                    Title            = $"Turn on automatic backups — {DeviceLabel(device)}",
                    Description      = "Automatic backups protect your photos, contacts, and files against " +
                                       "device loss, theft, hardware failure, or ransomware.",
                    WhyThisMatters   = "Without a backup, any data on this device could be lost permanently. " +
                                       "iCloud and Google One offer free storage tiers for a reasonable amount of data.",
                    GuidanceMarkdown = "**iPhone**: Settings → [Your Name] → iCloud → iCloud Backup → **Back Up This iPhone**\n\n" +
                                       "**Android**: Settings → Google → Backup → **Back up to Google Drive**\n\n" +
                                       "**Mac**: System Settings → Time Machine → select a backup disk\n\n" +
                                       "**Windows**: Settings → Update & Security → Backup → Add a drive",
                    Category         = TaskCategory.BackupRecovery,
                    Priority         = TaskPriority.Medium,
                    Phase            = TaskPhase.Next7Days,
                    SortOrder        = specs.Count + 1,
                });

            // Rule C: Find My / Find My Device not enabled.
            if (!device.FindMyDeviceEnabled)
                specs.Add(new TaskGenerationSpec
                {
                    GenerationKey    = GenerationKeyStrategy.Custom("device", "enable_find_my", device.Id.ToString("N")),
                    SourceType       = TaskSourceType.FamilySafetyPlan,
                    SourceId         = sourceId,
                    FamilyId         = familyId,
                    TargetType       = TaskTargetType.Device,
                    TargetId         = device.Id,
                    TargetLabel      = DeviceLabel(device),
                    Title            = $"Enable Find My / Find My Device — {DeviceLabel(device)}",
                    Description      = "Remote location tracking lets you find, lock, or wipe this device " +
                                       "if it is ever lost or stolen.",
                    WhyThisMatters   = "Enabling remote tracking before a device goes missing is the only way " +
                                       "to locate or remotely secure it afterwards.",
                    GuidanceMarkdown = "**iPhone/iPad/Mac**: Settings → [Your Name] → Find My → enable **Find My iPhone**\n\n" +
                                       "**Android**: Settings → Google → Find My Device → turn on\n\n" +
                                       "Test by visiting [find.google.com](https://find.google.com) or [icloud.com/find](https://www.icloud.com/find)",
                    Category         = TaskCategory.DeviceHygiene,
                    Priority         = TaskPriority.Medium,
                    Phase            = TaskPhase.Next7Days,
                    SortOrder        = specs.Count + 1,
                });

            // Rule D: End-of-life or no longer receiving security updates.
            if (device.SupportStatus is SupportStatus.EndOfLife or SupportStatus.NoLongerReceivingUpdates)
                specs.Add(new TaskGenerationSpec
                {
                    GenerationKey    = GenerationKeyStrategy.DeviceInstallSecurityPatches(device.Id),
                    SourceType       = TaskSourceType.FamilySafetyPlan,
                    SourceId         = sourceId,
                    FamilyId         = familyId,
                    TargetType       = TaskTargetType.Device,
                    TargetId         = device.Id,
                    TargetLabel      = DeviceLabel(device),
                    Title            = $"Address end-of-life security risk — {DeviceLabel(device)}",
                    Description      = "This device no longer receives security patches from its manufacturer. " +
                                       "Known vulnerabilities will never be fixed via software updates.",
                    WhyThisMatters   = "Unpatched devices are a frequent entry point for malware and network intrusions. " +
                                       "Limiting activity on this device and planning a replacement reduces your household's attack surface.",
                    GuidanceMarkdown = "**Short-term**: Stop using this device for banking, email, or sensitive services\n\n" +
                                       "**Medium-term**: Research a replacement device within your budget\n\n" +
                                       "**Before retiring**: Perform a factory reset to wipe all personal data",
                    Category         = TaskCategory.DeviceHygiene,
                    Priority         = TaskPriority.Medium,
                    Phase            = TaskPhase.Next30Days,
                    SortOrder        = specs.Count + 1,
                });

            // Rule E: Biometric authentication not enabled (low priority quality-of-life).
            if (!device.BiometricEnabled)
                specs.Add(new TaskGenerationSpec
                {
                    GenerationKey    = GenerationKeyStrategy.Custom("device", "enable_biometric", device.Id.ToString("N")),
                    SourceType       = TaskSourceType.FamilySafetyPlan,
                    SourceId         = sourceId,
                    FamilyId         = familyId,
                    TargetType       = TaskTargetType.Device,
                    TargetId         = device.Id,
                    TargetLabel      = DeviceLabel(device),
                    Title            = $"Enable biometric authentication — {DeviceLabel(device)}",
                    Description      = "Biometric unlock (fingerprint or face ID) combines convenience with security, " +
                                       "making it easier to keep the device locked while staying usable.",
                    WhyThisMatters   = "Biometrics reduce the friction of using a strong screen lock, " +
                                       "meaning family members are less likely to disable it for convenience.",
                    GuidanceMarkdown = "**iPhone**: Settings → Face ID & Passcode → Set up Face ID\n\n" +
                                       "**Android**: Settings → Security → Biometrics → Fingerprint or Face recognition\n\n" +
                                       "**Mac**: System Settings → Touch ID & Password → Add Fingerprint",
                    Category         = TaskCategory.DeviceHygiene,
                    Priority         = TaskPriority.Low,
                    Phase            = TaskPhase.Next30Days,
                    SortOrder        = specs.Count + 1,
                });
        }
#pragma warning restore CS0618

        // ════════════════════════════════════════════════════════════════════
        // GROUP 4 — Member-based rules
        // ════════════════════════════════════════════════════════════════════

        foreach (var person in persons)
        {
            // Rule A: Scam readiness score below threshold → review with each member.
            if (assessment is not null && assessment.ScamReadinessScore < ScoreLow)
                specs.Add(new TaskGenerationSpec
                {
                    GenerationKey    = GenerationKeyStrategy.Custom("member", "scam_awareness_review", person.Id.ToString("N")),
                    SourceType       = TaskSourceType.FamilySafetyPlan,
                    SourceId         = sourceId,
                    FamilyId         = familyId,
                    TargetType       = TaskTargetType.FamilyMember,
                    TargetId         = person.Id,
                    TargetLabel      = person.DisplayName,
                    Title            = $"Scam awareness review — {person.DisplayName}",
                    Description      = $"Sit down with {person.DisplayName} and walk through common scam tactics " +
                                       "relevant to their age group and online habits.",
                    WhyThisMatters   = "Scam awareness is a household skill — one vulnerable family member " +
                                       "can expose the whole family to financial and data loss.",
                    GuidanceMarkdown = "1. Review the **Scams** section in your safety plan together\n" +
                                       "2. Practice identifying a suspicious email or SMS message\n" +
                                       $"3. Agree on a household verification code to use before any urgent payment requests\n" +
                                       "4. Bookmark [scamwatch.gov.au](https://www.scamwatch.gov.au) as a quick reference",
                    Category         = TaskCategory.ScamReadiness,
                    Priority         = TaskPriority.Medium,
                    Phase            = TaskPhase.Ongoing,
                    SortOrder        = specs.Count + 1,
                });

            // Rule B: Adult member without a confirmed primary ecosystem.
            if (person.AgeGroup is AgeGroup.Adult or AgeGroup.Senior
                && string.IsNullOrWhiteSpace(person.PrimaryEcosystem))
                specs.Add(new TaskGenerationSpec
                {
                    GenerationKey    = GenerationKeyStrategy.Custom("member", "confirm_ecosystem", person.Id.ToString("N")),
                    SourceType       = TaskSourceType.FamilySafetyPlan,
                    SourceId         = sourceId,
                    FamilyId         = familyId,
                    TargetType       = TaskTargetType.FamilyMember,
                    TargetId         = person.Id,
                    TargetLabel      = person.DisplayName,
                    Title            = $"Confirm primary device ecosystem — {person.DisplayName}",
                    Description      = $"We don't have a confirmed device ecosystem on file for {person.DisplayName}. " +
                                       "Knowing whether they use Apple, Google, or Microsoft unlocks tailored recommendations.",
                    WhyThisMatters   = "Ecosystem-specific guidance (e.g. Apple ID security vs Google Account security) " +
                                       "is more actionable and easier to follow than generic advice.",
                    GuidanceMarkdown = "1. Open the **Family Members** section of the app\n" +
                                       $"2. Edit {person.DisplayName}'s profile\n" +
                                       "3. Set **Primary Ecosystem** to Apple, Google, or Microsoft",
                    Category         = TaskCategory.FamilySafety,
                    Priority         = TaskPriority.Low,
                    Phase            = TaskPhase.Next30Days,
                    SortOrder        = specs.Count + 1,
                });
        }

        // ════════════════════════════════════════════════════════════════════
        // FALLBACKS — always-applicable tasks emitted when data is sparse
        // ════════════════════════════════════════════════════════════════════

        FillFallbacks(specs, context, bookingId, familyId, sourceId);

        return specs.AsReadOnly();
    }

    // ── Fallbacks ─────────────────────────────────────────────────────────────

    private static void FillFallbacks(
        List<TaskGenerationSpec> specs,
        FulfillmentContext context,
        Guid bookingId,
        Guid familyId,
        string sourceId)
    {
        // Fallback 1: Set up a family password manager (always a foundational task).
        if (!specs.Any(s => s.Category == TaskCategory.AccountSecurity
                         && s.Title.Contains("password manager", StringComparison.OrdinalIgnoreCase)))
        {
            specs.Add(new TaskGenerationSpec
            {
                GenerationKey    = GenerationKeyStrategy.BookingTask(Slug, bookingId, 900),
                SourceType       = TaskSourceType.FamilySafetyPlan,
                SourceId         = sourceId,
                FamilyId         = familyId,
                TargetType       = TaskTargetType.Family,
                Title            = "Set up a family password manager",
                Description      = "A password manager generates and stores unique, strong passwords for every account, " +
                                   "eliminating the risk of password reuse across services.",
                WhyThisMatters   = "Password reuse is the most common cause of account takeover. " +
                                   "A shared family vault means everyone's accounts benefit from strong, unique credentials.",
                GuidanceMarkdown = "Recommended options:\n" +
                                   "- **1Password Families** — shared vaults, emergency access\n" +
                                   "- **Bitwarden** — free tier available, open source\n" +
                                   "- **Apple Keychain** — built-in for Apple-ecosystem families\n\n" +
                                   "Start by migrating the 5 most important accounts (email, banking, work).",
                HelpLink         = "https://www.consumer.ftc.gov/articles/password-managers",
                Category         = TaskCategory.AccountSecurity,
                Priority         = TaskPriority.Medium,
                Phase            = TaskPhase.Next7Days,
                SortOrder        = 900,
            });
        }

        // Fallback 2: Check credentials on haveibeenpwned.com.
        if (!specs.Any(s => s.Category == TaskCategory.AccountSecurity
                         && s.Title.Contains("breach", StringComparison.OrdinalIgnoreCase)))
        {
            specs.Add(new TaskGenerationSpec
            {
                GenerationKey    = GenerationKeyStrategy.BookingTask(Slug, bookingId, 901),
                SourceType       = TaskSourceType.FamilySafetyPlan,
                SourceId         = sourceId,
                FamilyId         = familyId,
                TargetType       = TaskTargetType.Family,
                Title            = "Check all family email addresses for known data breaches",
                Description      = "Visit haveibeenpwned.com with every email address used by your family " +
                                   "to find out if any credentials have been exposed in known data breaches.",
                WhyThisMatters   = "Billions of username-password combinations from past breaches are freely available online. " +
                                   "Knowing which accounts are at risk lets you prioritise password changes.",
                GuidanceMarkdown = "1. Go to [haveibeenpwned.com](https://haveibeenpwned.com)\n" +
                                   "2. Enter each family email address\n" +
                                   "3. For any breach found — change the password on that account immediately\n" +
                                   "4. Enable breach alerts to get notified of future exposure",
                HelpLink         = "https://haveibeenpwned.com",
                Category         = TaskCategory.AccountSecurity,
                Priority         = TaskPriority.Low,
                Phase            = TaskPhase.Next30Days,
                SortOrder        = 901,
            });
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static int AccountTypePriority(Account account) => account.AccountType switch
    {
        AccountType.Banking    => 1,
        AccountType.Email      => 2,
        AccountType.Work       => 3,
        AccountType.Government => 4,
        AccountType.Healthcare => 5,
        _                      => 10,
    };

#pragma warning disable CS0618
    private static string DeviceLabel(Device device)
    {
        var parts = new[] { device.Brand, device.Model }
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .ToArray();

        return parts.Length > 0 ? string.Join(" ", parts) : "your device";
    }
#pragma warning restore CS0618
}
