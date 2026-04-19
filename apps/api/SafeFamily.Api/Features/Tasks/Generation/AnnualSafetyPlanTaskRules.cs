using SafeFamily.Api.Domain.Accounts;
using SafeFamily.Api.Domain.Devices;
using SafeFamily.Api.Domain.Families;
using SafeFamily.Api.Domain.Tasks;
using SafeFamily.Api.Features.Fulfillment;

namespace SafeFamily.Api.Features.Tasks.Generation;

/// <summary>
/// Rule definitions and full-coverage selection logic for the Annual Safety Plan
/// (ANNUAL-PLAN) package.
///
/// <para>
/// <b>Four task groups</b>
/// <list type="number">
///   <item>
///     <b>Quarterly recurring tasks</b> (sort 1–9) — scheduled reviews due every 90 days.
///     <c>Phase = Recurring</c>, <c>DueAt = now + 90 days</c>.
///     Keyed on booking + slot index: refresh by calling <c>RegenerateAsync</c> each quarter
///     with the same specs to supersede the previous cycle's tasks and reset <c>DueAt</c>.
///   </item>
///   <item>
///     <b>Annual review tasks</b> (sort 10–17) — deeper once-a-year actions.
///     <c>Phase = Recurring</c>, <c>DueAt = now + 365 days</c>.
///     Same regeneration pattern — a yearly scheduled job calls <c>RegenerateAsync</c>.
///   </item>
///   <item>
///     <b>Ongoing premium habits</b> (sort 20–25) — undated lifestyle tasks.
///     <c>Phase = Ongoing</c>, no <c>DueAt</c>.  Generated once; not regenerated on a schedule.
///   </item>
///   <item>
///     <b>Account and device gap tasks</b> (sort 50+/70+) — entity-specific remediation tasks
///     generated only when a protection gap is detected.  Uses the same entity-keyed generation
///     keys as <see cref="FamilySafetyPlanTaskRules"/> so they deduplicate correctly when both
///     products are active.
///   </item>
/// </list>
/// </para>
///
/// <para>
/// <b>Quarterly refresh protocol (for background jobs)</b><br/>
/// To push a new cycle, reload the <see cref="FulfillmentContext"/> for the booking
/// (kept on the original <c>Booking</c> record) and call:
/// <code>
///   var specs = AnnualSafetyPlanTaskRules.SelectSpecs(context, booking.Id);
///   await taskGenerationService.RegenerateAsync(genContext, specs, ct);
/// </code>
/// The engine marks each matching task Superseded and creates a fresh copy with
/// <c>DueAt</c> advanced by 90 days (quarterly) or 365 days (annual).
/// </para>
/// </summary>
internal static class AnnualSafetyPlanTaskRules
{
    private const string Slug = GenerationKeyStrategy.ProductSlugAnnualPlan;

    // ── Cadence constants ─────────────────────────────────────────────────────

    private const int QuarterlyDays = 90;
    private const int AnnualDays    = 365;

    // ── Public entry point ────────────────────────────────────────────────────

    /// <summary>
    /// Builds the full set of annual-plan task specs for the fulfillment context.
    ///
    /// Specs are ordered: Quarterly → Annual → Ongoing → Account gaps → Device gaps → Member tasks.
    /// All specs are premium-gated (<c>IsPremium = true</c>).
    /// </summary>
    public static IReadOnlyList<TaskGenerationSpec> SelectSpecs(
        FulfillmentContext context, Guid bookingId)
    {
        var specs     = new List<TaskGenerationSpec>();
        var familyId  = context.Booking.FamilyId;
        var sourceId  = bookingId.ToString("N");
        var now       = DateTimeOffset.UtcNow;

        // ════════════════════════════════════════════════════════════════════
        // GROUP 1 — Quarterly recurring tasks (sort 1–9)
        // ════════════════════════════════════════════════════════════════════

        int sort = 1;

        specs.Add(Build(bookingId, familyId, sourceId, sort++,
            title:            "Quarterly account security review",
            description:      "Review all family accounts: check for weak or reused passwords, verify 2FA is active on every critical account, " +
                              "and scan sign-in history for any unfamiliar locations or devices.",
            whyThisMatters:   "Regular quarterly reviews catch credential reuse and forgotten 2FA gaps before attackers can exploit them. " +
                              "Credential stuffing attacks succeed almost exclusively against accounts that have not been reviewed in months.",
            guidance:
                "1. Open each account listed under **Accounts** in SafeFamily\n" +
                "2. Check **Settings → Security → Active sessions** — revoke any you do not recognise\n" +
                "3. Confirm 2FA is enabled and using an authenticator app (not SMS) on each account\n" +
                "4. Use your password manager to identify and replace any weak or reused passwords\n" +
                "5. Update the account record in SafeFamily if any settings have changed",
            category:         TaskCategory.AccountSecurity,
            priority:         TaskPriority.Medium,
            phase:            TaskPhase.Recurring,
            dueAt:            now.AddDays(QuarterlyDays)));

        specs.Add(Build(bookingId, familyId, sourceId, sort++,
            title:            "Quarterly device backup check",
            description:      "Verify that automatic cloud backups are running successfully on every family device. " +
                              "Confirm each device's most recent backup timestamp and test that at least one device can restore from backup.",
            whyThisMatters:   "Backup jobs silently fail more often than families realise — iCloud storage can fill up, " +
                              "Google Drive permissions can lapse, and manual backup habits slip. " +
                              "A quarterly check ensures you are not surprised when a device is lost or damaged.",
            guidance:
                "**iPhone**: Settings → [Your Name] → iCloud → iCloud Backup → check **Last Backup** date\n\n" +
                "**Android**: Settings → Google → Backup → **Last backup** timestamp\n\n" +
                "**Mac**: System Settings → Time Machine → verify last completed backup\n\n" +
                "**Windows**: Settings → Update & Security → Backup → check last backup date",
            category:         TaskCategory.BackupRecovery,
            priority:         TaskPriority.Medium,
            phase:            TaskPhase.Recurring,
            dueAt:            now.AddDays(QuarterlyDays)));

        specs.Add(Build(bookingId, familyId, sourceId, sort++,
            title:            "Quarterly app permissions audit",
            description:      "Review location, camera, microphone, and contacts permissions on all family mobile devices. " +
                              "Remove any app you no longer actively use and revoke permissions from apps that do not need them.",
            whyThisMatters:   "Apps accumulate permissions over time and many continue collecting background location data " +
                              "or camera access long after they were last used. A quarterly audit reduces your family's data exposure footprint.",
            guidance:
                "**iOS**: Settings → Privacy & Security → review each category (Location, Camera, Microphone, Contacts)\n\n" +
                "**Android**: Settings → Privacy → Permission manager → review each category\n\n" +
                "For each app with sensitive permissions: ask — is this app still used? Does it need this permission to work?",
            category:         TaskCategory.PrivacySharing,
            priority:         TaskPriority.Medium,
            phase:            TaskPhase.Recurring,
            dueAt:            now.AddDays(QuarterlyDays)));

        specs.Add(Build(bookingId, familyId, sourceId, sort++,
            title:            "Quarterly breach exposure check",
            description:      "Check every family email address on haveibeenpwned.com to identify any newly reported data breaches " +
                              "that include your credentials. Change passwords immediately for any newly flagged accounts.",
            whyThisMatters:   "New breach datasets are published constantly — an email address that was clean last quarter " +
                              "may now appear in a newly released breach. A quarterly check keeps you ahead of credential-stuffing attacks.",
            guidance:
                "1. Visit [haveibeenpwned.com](https://haveibeenpwned.com)\n" +
                "2. Enter each family email address\n" +
                "3. For any newly listed breach: change that service's password immediately using your password manager\n" +
                "4. Consider subscribing to automatic breach notifications at [haveibeenpwned.com/NotifyMe](https://haveibeenpwned.com/NotifyMe)",
            category:         TaskCategory.AccountSecurity,
            priority:         TaskPriority.Medium,
            phase:            TaskPhase.Recurring,
            dueAt:            now.AddDays(QuarterlyDays),
            helpLink:         "https://haveibeenpwned.com"));

        specs.Add(Build(bookingId, familyId, sourceId, sort++,
            title:            "Quarterly review of connected third-party app access",
            description:      "Audit all third-party apps and services that have been granted OAuth access to family email, " +
                              "cloud storage, and social media accounts. Revoke access for any you no longer use or do not recognise.",
            whyThisMatters:   "OAuth access granted to a third-party app persists indefinitely unless explicitly revoked. " +
                              "Apps you used once years ago may still have read (or write) access to your email and files.",
            guidance:
                "**Google**: [myaccount.google.com/permissions](https://myaccount.google.com/permissions)\n\n" +
                "**Apple**: [appleid.apple.com](https://appleid.apple.com) → Apps Using Apple ID\n\n" +
                "**Microsoft**: [account.microsoft.com](https://account.microsoft.com) → Privacy → Apps and services\n\n" +
                "Remove access for any app that is: no longer used, unrecognised, or has broader permissions than it needs.",
            category:         TaskCategory.PrivacySharing,
            priority:         TaskPriority.Low,
            phase:            TaskPhase.Recurring,
            dueAt:            now.AddDays(QuarterlyDays)));

        // ════════════════════════════════════════════════════════════════════
        // GROUP 2 — Annual review tasks (sort 10–17)
        // ════════════════════════════════════════════════════════════════════

        sort = 10;

        specs.Add(Build(bookingId, familyId, sourceId, sort++,
            title:            "Re-run the SafeFamily digital safety assessment",
            description:      "Complete a fresh SafeFamily assessment to refresh your family's risk scores across all six safety pillars. " +
                              "Your scores from last year may no longer reflect your current device lineup, account roster, or household configuration.",
            whyThisMatters:   "A new device, a new family member joining, or a change in how you use cloud services can shift your " +
                              "risk profile significantly. An annual assessment ensures your safety plan stays calibrated to your real situation.",
            guidance:
                "1. Go to **Assessment** in the SafeFamily app\n" +
                "2. Start a new assessment — it takes approximately 10 minutes\n" +
                "3. Review your updated scores across Account Security, Device Hygiene, Backup, Privacy, Scam Readiness, and Network Security\n" +
                "4. Your advisor will review the updated results and may adjust your plan",
            category:         TaskCategory.AccountSecurity,
            priority:         TaskPriority.Medium,
            phase:            TaskPhase.Recurring,
            dueAt:            now.AddDays(AnnualDays)));

        specs.Add(Build(bookingId, familyId, sourceId, sort++,
            title:            "Review and refresh account recovery contacts",
            description:      "Check the recovery email address and phone number on all critical accounts — email, banking, government services, and cloud storage. " +
                              "Update any that use an old address or number you no longer control.",
            whyThisMatters:   "Recovery contacts are the last line of defence when you are locked out. " +
                              "An outdated recovery email or a number tied to a cancelled SIM makes accounts permanently unrecoverable " +
                              "and gives attackers a trivial path to account takeover via 'forgot password'.",
            guidance:
                "For each critical account:\n" +
                "1. Go to **Settings → Security → Recovery options**\n" +
                "2. Verify the recovery email is an address you still control and monitor\n" +
                "3. Verify the recovery phone number is your current mobile number\n" +
                "4. Remove any old or unrecognised recovery options",
            category:         TaskCategory.AccountSecurity,
            priority:         TaskPriority.Medium,
            phase:            TaskPhase.Recurring,
            dueAt:            now.AddDays(AnnualDays)));

        specs.Add(Build(bookingId, familyId, sourceId, sort++,
            title:            "Annual scam awareness session with all family members",
            description:      "Run a practical scam awareness session with every household member. " +
                              "Cover the top current scam types, how to verify unusual requests, your family code word and reporting process.",
            whyThisMatters:   "Scam tactics evolve every year. An awareness session run twelve months ago does not prepare " +
                              "family members for the latest voice-cloning, AI-generated phishing, or gift card scams. " +
                              "Specific examples discussed together dramatically improve recognition rates.",
            guidance:
                "1. Visit your national consumer protection body for the latest scam alerts\n" +
                "   - **Australia**: [scamwatch.gov.au](https://www.scamwatch.gov.au)\n" +
                "   - **UK**: [actionfraud.police.uk](https://www.actionfraud.police.uk)\n" +
                "   - **US**: [consumer.ftc.gov/scams](https://consumer.ftc.gov/scams)\n" +
                "2. Discuss 2–3 recent scam examples as a family\n" +
                "3. Re-confirm your **family code word** for urgent requests\n" +
                "4. Remind everyone: no legitimate organisation asks for payment via gift cards, wire transfer, or crypto",
            category:         TaskCategory.ScamReadiness,
            priority:         TaskPriority.Medium,
            phase:            TaskPhase.Recurring,
            dueAt:            now.AddDays(AnnualDays)));

        specs.Add(Build(bookingId, familyId, sourceId, sort++,
            title:            "Review home router and network security settings",
            description:      "Log in to your home router's admin panel and verify key security settings: " +
                              "firmware is up to date, default admin password has been changed, WPA3 (or WPA2) encryption is enabled, " +
                              "and remote management is disabled.",
            whyThisMatters:   "Routers are the gateway to every device in your home. " +
                              "An outdated router with the manufacturer's default password is one of the easiest targets for attackers — " +
                              "compromise gives them visibility into everything on your network.",
            guidance:
                "1. Find your router's admin IP (usually printed on the device — often 192.168.1.1 or 192.168.0.1)\n" +
                "2. Log in and check: **Firmware version** → apply any available updates\n" +
                "3. **Change the admin password** if it is still the factory default\n" +
                "4. Under **Wireless settings**: confirm encryption is set to **WPA3** or **WPA2-AES** (not WEP or WPA)\n" +
                "5. Disable **Remote management** if enabled\n" +
                "6. Consider creating a separate **Guest network** for IoT devices (TVs, smart speakers, etc.)",
            category:         TaskCategory.NetworkSecurity,
            priority:         TaskPriority.Low,
            phase:            TaskPhase.Recurring,
            dueAt:            now.AddDays(AnnualDays)));

        // ════════════════════════════════════════════════════════════════════
        // GROUP 3 — Ongoing premium habits (sort 20–25)
        // ════════════════════════════════════════════════════════════════════

        sort = 20;

        specs.Add(Build(bookingId, familyId, sourceId, sort++,
            title:            "Maintain your family password manager",
            description:      "Ensure every family member is actively using the password manager and that all new accounts " +
                              "they create are added to it with unique, generated passwords.",
            whyThisMatters:   "Password reuse is the single largest cause of account takeover. " +
                              "A password manager that is set up but not maintained drifts — new accounts get weak passwords, " +
                              "old logins remain unimported, and the protection gap widens.",
            guidance:
                "1. Review the password manager for accounts with duplicate or weak passwords\n" +
                "2. Ensure every family member who owns an account has their own vault or shared-family structure\n" +
                "3. Check that the master password or biometric is strong and not reused elsewhere\n" +
                "4. Export a backup of the vault and store it encrypted offline",
            category:         TaskCategory.AccountSecurity,
            priority:         TaskPriority.Low,
            phase:            TaskPhase.Ongoing));

        specs.Add(Build(bookingId, familyId, sourceId, sort++,
            title:            "Keep all family devices updated to the latest OS and security patches",
            description:      "Ensure every phone, tablet, and computer in the household is running the latest " +
                              "available OS version and has automatic security updates enabled.",
            whyThisMatters:   "The majority of successful malware attacks target known vulnerabilities in outdated software. " +
                              "OS vendors publish security patches within days of public disclosure — delayed updates " +
                              "leave devices exposed to attacks that require no user interaction.",
            guidance:
                "**iPhone/iPad**: Settings → General → Software Update → enable **Automatic Updates**\n\n" +
                "**Android**: Settings → System → System update → check for updates\n\n" +
                "**Mac**: System Settings → General → Software Update → turn on **Automatic updates**\n\n" +
                "**Windows**: Settings → Windows Update → turn on **Automatic updates**",
            category:         TaskCategory.DeviceHygiene,
            priority:         TaskPriority.Low,
            phase:            TaskPhase.Ongoing));

        specs.Add(Build(bookingId, familyId, sourceId, sort++,
            title:            "Maintain your 3-2-1 backup strategy for critical family files",
            description:      "Verify your family maintains three copies of important data: " +
                              "on the device, on a local external drive, and in cloud storage. " +
                              "Test that at least one backup can be successfully restored.",
            whyThisMatters:   "Ransomware, accidental deletion, and sudden hardware failure are all real risks. " +
                              "A 3-2-1 backup strategy ensures that no single failure — including a cloud outage or stolen device — " +
                              "results in permanent data loss.",
            guidance:
                "1. Confirm cloud backup is active on all devices (iCloud, Google Drive, OneDrive)\n" +
                "2. Plug in your external backup drive and run a backup\n" +
                "3. **Test restoration**: pick one file or folder and restore it from your cloud backup to confirm it works\n" +
                "4. Archive: keep a cold copy of irreplaceable items (passports, birth certs, photos) in an encrypted cloud folder",
            category:         TaskCategory.BackupRecovery,
            priority:         TaskPriority.Low,
            phase:            TaskPhase.Ongoing));

        // ════════════════════════════════════════════════════════════════════
        // GROUP 4 — Account security gap tasks (sort 50+)
        // Generated per account only when a protection gap is present.
        // Uses entity-keyed generation keys for cross-product deduplication.
        // ════════════════════════════════════════════════════════════════════

        AddAccountGapTasks(specs, context, familyId, sourceId);

        // ════════════════════════════════════════════════════════════════════
        // GROUP 5 — Member-specific tasks (sort 70+)
        // ════════════════════════════════════════════════════════════════════

        AddMemberTasks(specs, context, familyId, sourceId, bookingId, now);

        return specs.AsReadOnly();
    }

    // ── Account gap tasks ─────────────────────────────────────────────────────

    private static void AddAccountGapTasks(
        List<TaskGenerationSpec> specs,
        FulfillmentContext context,
        Guid familyId,
        string sourceId)
    {
        var accounts = context.Accounts;
        if (accounts.Count == 0) return;

        int sort = 50;

        foreach (var account in accounts.OrderBy(AccountTypePriority))
        {
            // Suspicious activity → high-priority immediate sign-out task.
            if (account.SuspiciousActivityFlag)
                specs.Add(new TaskGenerationSpec
                {
                    GenerationKey    = GenerationKeyStrategy.AccountSignOutAllSessions(account.Id),
                    SourceType       = TaskSourceType.AnnualPlan,
                    SourceId         = sourceId,
                    FamilyId         = familyId,
                    TargetType       = TaskTargetType.Account,
                    TargetId         = account.Id,
                    TargetLabel      = account.MaskedIdentifier,
                    Title            = $"Sign out of all active sessions — {account.MaskedIdentifier}",
                    Description      = "Suspicious activity has been flagged on this account. " +
                                       "Sign out of all active sessions immediately, then change the password and enable 2FA.",
                    WhyThisMatters   = "Revoking all sessions instantly cuts off any ongoing unauthorised access. " +
                                       "This must happen before — or simultaneously with — the password change.",
                    GuidanceMarkdown = "1. Go to **Settings → Security → Active sessions** (or 'Where you're signed in')\n" +
                                       "2. Select **Sign out of all other sessions**\n" +
                                       "3. Change the password immediately after\n" +
                                       "4. Enable 2FA if not already active",
                    Category         = TaskCategory.AccountSecurity,
                    Priority         = TaskPriority.High,
                    Phase            = TaskPhase.Immediate,
                    SortOrder        = sort++,
                    IsPremium        = true,
                });

            // 2FA not enabled → critical or standard priority based on account type.
            if (account.TwoFactorStatus != TwoFactorStatus.Enabled)
            {
                var isCritical = account.AccountType is AccountType.Email or AccountType.Banking;
                specs.Add(new TaskGenerationSpec
                {
                    GenerationKey    = GenerationKeyStrategy.AccountEnable2Fa(account.Id),
                    SourceType       = TaskSourceType.AnnualPlan,
                    SourceId         = sourceId,
                    FamilyId         = familyId,
                    TargetType       = TaskTargetType.Account,
                    TargetId         = account.Id,
                    TargetLabel      = account.MaskedIdentifier,
                    Title            = $"Enable two-factor authentication — {account.MaskedIdentifier}",
                    Description      = "This account has no second sign-in factor. " +
                                       "Enabling 2FA makes stolen passwords insufficient for attackers to gain access.",
                    WhyThisMatters   = account.AccountType == AccountType.Email
                        ? "Your email is the recovery gateway for every other account. 2FA on email is your single most impactful security action."
                        : account.AccountType == AccountType.Banking
                        ? "Banking accounts are the highest-value fraud target. 2FA stops credential-stuffing attacks instantly."
                        : "2FA protects against password theft, phishing, and data-breach exposure.",
                    GuidanceMarkdown = "1. Go to **Settings → Security → Two-factor authentication**\n" +
                                       "2. Choose an **authenticator app** (Google Authenticator, Microsoft Authenticator) over SMS\n" +
                                       "3. Save your **backup codes** offline",
                    Category         = TaskCategory.AccountSecurity,
                    Priority         = isCritical ? TaskPriority.High : TaskPriority.Medium,
                    Phase            = isCritical ? TaskPhase.Immediate : TaskPhase.Next7Days,
                    SortOrder        = sort++,
                    IsPremium        = true,
                });
            }

            // No recovery email → medium-priority next-30-day task.
            if (account.RecoveryEmailStatus != RecoveryStatus.Set)
                specs.Add(new TaskGenerationSpec
                {
                    GenerationKey    = GenerationKeyStrategy.AccountAddRecoveryEmail(account.Id),
                    SourceType       = TaskSourceType.AnnualPlan,
                    SourceId         = sourceId,
                    FamilyId         = familyId,
                    TargetType       = TaskTargetType.Account,
                    TargetId         = account.Id,
                    TargetLabel      = account.MaskedIdentifier,
                    Title            = $"Add a recovery email address — {account.MaskedIdentifier}",
                    Description      = "Without a recovery address you risk permanently losing access to this account " +
                                       "if you forget your password or lose your 2FA device.",
                    WhyThisMatters   = "A recovery email gives you a trusted fallback path to regain access — " +
                                       "without one, account recovery depends entirely on support tickets that attackers can often intercept.",
                    GuidanceMarkdown = "1. Open **Security settings** on this account\n" +
                                       "2. Find **Recovery options** or **Account recovery**\n" +
                                       "3. Add a recovery email address you actively monitor\n" +
                                       "4. Verify the address by clicking the confirmation link",
                    Category         = TaskCategory.AccountSecurity,
                    Priority         = TaskPriority.Medium,
                    Phase            = TaskPhase.Next30Days,
                    SortOrder        = sort++,
                    IsPremium        = true,
                });
        }
    }

    // ── Member-specific tasks ─────────────────────────────────────────────────

    private static void AddMemberTasks(
        List<TaskGenerationSpec> specs,
        FulfillmentContext context,
        Guid familyId,
        string sourceId,
        Guid bookingId,
        DateTimeOffset now)
    {
        var persons = context.FamilyPersons;
        if (persons.Count == 0) return;

        int sort = 70;

        var hasChildren = persons.Any(p => p.AgeGroup is AgeGroup.Child or AgeGroup.Teen);
        var hasSeniors  = persons.Any(p => p.AgeGroup == AgeGroup.Senior);

        // Parental controls review — generated once when children are in the household.
        if (hasChildren)
        {
            var childNames = persons
                .Where(p => p.AgeGroup is AgeGroup.Child or AgeGroup.Teen)
                .Select(p => p.DisplayName)
                .ToList();
            var childLabel = childNames.Count == 1
                ? childNames[0]
                : $"{childNames[0]} and {childNames.Count - 1} other{(childNames.Count > 2 ? "s" : "")}";

            specs.Add(new TaskGenerationSpec
            {
                GenerationKey    = GenerationKeyStrategy.BookingTask(Slug, bookingId, 900),
                SourceType       = TaskSourceType.AnnualPlan,
                SourceId         = sourceId,
                FamilyId         = familyId,
                TargetType       = TaskTargetType.Family,
                Title            = $"Annual parental controls review — {childLabel}",
                Description      = $"Review and update parental controls, screen time limits, and content filters " +
                                   $"for {childLabel}. Age-appropriate settings change as children grow — a review each year keeps protections aligned with maturity.",
                WhyThisMatters   = "Children's digital needs and risks evolve quickly. Controls set for an 8-year-old are too restrictive " +
                                   "for a 14-year-old, while a 14-year-old still needs protection from adult content and contact risks. " +
                                   "An annual review keeps the balance right.",
                GuidanceMarkdown =
                    "**iPhone/iPad (Screen Time)**: Settings → Screen Time → review App Limits, Communication Limits, and Content & Privacy Restrictions\n\n" +
                    "**Android (Family Link)**: Open Family Link app → select child → review app approvals, screen time, and location sharing\n\n" +
                    "**Review account privacy settings** on any social media accounts used by teenagers\n\n" +
                    "Discuss with each child what has changed in how they use the internet since last year",
                Category         = TaskCategory.FamilySafety,
                Priority         = TaskPriority.Medium,
                Phase            = TaskPhase.Recurring,
                SortOrder        = sort++,
                DueAt            = now.AddDays(AnnualDays),
                IsPremium        = true,
            });
        }

        // Scam awareness for seniors — generated once when senior members are in the household.
        if (hasSeniors)
        {
            var seniorNames = persons
                .Where(p => p.AgeGroup == AgeGroup.Senior)
                .Select(p => p.DisplayName)
                .ToList();
            var seniorLabel = seniorNames.Count == 1
                ? seniorNames[0]
                : string.Join(", ", seniorNames[..^1]) + $" and {seniorNames[^1]}";

            specs.Add(new TaskGenerationSpec
            {
                GenerationKey    = GenerationKeyStrategy.BookingTask(Slug, bookingId, 901),
                SourceType       = TaskSourceType.AnnualPlan,
                SourceId         = sourceId,
                FamilyId         = familyId,
                TargetType       = TaskTargetType.Family,
                Title            = $"Phishing and scam readiness review with {seniorLabel}",
                Description      = $"Run a targeted scam awareness conversation with {seniorLabel} covering the scam types " +
                                   "most commonly aimed at senior family members: fake tech support, government impersonation, romance scams, and investment fraud.",
                WhyThisMatters   = "Adults over 60 are disproportionately targeted by scammers and suffer the highest financial losses per incident. " +
                                   "A familiar face walking through recent examples in plain language is the most effective training any family member can receive.",
                GuidanceMarkdown =
                    "Walk through these scenarios together:\n\n" +
                    "1. **Fake tech support**: caller says your computer has a virus and asks for remote access or gift card payment\n" +
                    "2. **Government impersonation**: ATO, Medicare, or police caller demands immediate payment to avoid arrest\n" +
                    "3. **Investment/cryptocurrency scam**: unsolicited 'opportunity' promising high returns with low risk\n" +
                    "4. **Romance scam**: online relationship develops quickly, then a financial request is made\n\n" +
                    "Key rules to reinforce:\n" +
                    "- **Hang up** on any unsolicited call that creates urgency or requests payment\n" +
                    "- **Never share** banking details, government ID, or one-time codes over the phone\n" +
                    "- Use the **family code word** before sending any money to a relative who calls unexpectedly",
                Category         = TaskCategory.ScamReadiness,
                Priority         = TaskPriority.Medium,
                Phase            = TaskPhase.Recurring,
                SortOrder        = sort++,
                DueAt            = now.AddDays(AnnualDays),
                IsPremium        = true,
            });
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Builds a booking-keyed spec for booking-level recurring and ongoing tasks.
    /// Uses <see cref="GenerationKeyStrategy.BookingTask"/> so keys are stable and idempotent
    /// within a single booking — safe to call <c>GenerateAsync</c> or <c>RegenerateAsync</c>
    /// any number of times with the same index without producing duplicates.
    /// </summary>
    private static TaskGenerationSpec Build(
        Guid bookingId,
        Guid familyId,
        string sourceId,
        int index,
        string title,
        string description,
        string whyThisMatters,
        string guidance,
        TaskCategory category,
        TaskPriority priority,
        TaskPhase phase,
        DateTimeOffset? dueAt = null,
        string? helpLink = null)
        => new()
        {
            GenerationKey    = GenerationKeyStrategy.BookingTask(Slug, bookingId, index),
            SourceType       = TaskSourceType.AnnualPlan,
            SourceId         = sourceId,
            FamilyId         = familyId,
            TargetType       = TaskTargetType.Family,
            Title            = title,
            Description      = description,
            WhyThisMatters   = whyThisMatters,
            GuidanceMarkdown = guidance,
            HelpLink         = helpLink,
            Category         = category,
            Priority         = priority,
            Phase            = phase,
            SortOrder        = index,
            DueAt            = dueAt,
            IsPremium        = true,
        };

    private static int AccountTypePriority(Account account) => account.AccountType switch
    {
        AccountType.Banking    => 1,
        AccountType.Email      => 2,
        AccountType.Work       => 3,
        AccountType.Government => 4,
        AccountType.Healthcare => 5,
        _                      => 10,
    };
}
