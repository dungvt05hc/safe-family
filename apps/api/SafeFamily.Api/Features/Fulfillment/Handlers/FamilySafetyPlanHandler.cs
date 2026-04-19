using System.Text;
using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Assessments;
using SafeFamily.Api.Domain.Checklists;
using SafeFamily.Api.Domain.Families;
using SafeFamily.Api.Domain.Plans;
using SafeFamily.Api.Domain.Reports;
using SafeFamily.Api.Features.Tasks.Generation;

namespace SafeFamily.Api.Features.Fulfillment.Handlers;

/// <summary>
/// Fulfillment handler for the FAMILY-CORE package.
///
/// Creates a <see cref="FamilySafetyPlan"/> record with four structured content sections
/// derived from the family's latest assessment scores and member profiles, plus a placeholder
/// report and 5 high-priority checklist items.
/// </summary>
public sealed class FamilySafetyPlanHandler(
    AppDbContext db,
    ISafetyTaskGenerationService taskGenerationService) : IPackageFulfillmentHandler
{
    public async Task<TaskGenerationResult?> PrepareAsync(FulfillmentContext context, CancellationToken ct = default)
    {
        var booking    = context.Booking;
        var assessment = context.LatestAssessment;
        var persons    = context.FamilyPersons;

        // ── Generate structured plan content from assessment + member data ─────

        var topRisks         = GenerateTopRisks(assessment);
        var topPriorities    = GenerateTopPriorities(assessment);
        var planByMember     = GenerateActionPlanByMember(persons, assessment);
        var planByDevice     = GenerateActionPlanByDevice();

        // ── Persist FamilySafetyPlan entity ───────────────────────────────────

        db.FamilySafetyPlans.Add(new FamilySafetyPlan
        {
            FamilyId              = booking.FamilyId,
            BookingId             = booking.Id,
            SourceAssessmentId    = assessment?.Id,
            AssessmentOverallScore = assessment?.OverallScore,
            AssessmentRiskLevel   = assessment?.RiskLevel.ToString(),
            TopRisks              = topRisks,
            TopPriorities         = topPriorities,
            ActionPlanByMember    = planByMember,
            ActionPlanByDevice    = planByDevice,
            Status                = PlanStatus.Generated,
        });

        // ── Placeholder report ────────────────────────────────────────────────

        db.Reports.Add(new Report
        {
            FamilyId    = booking.FamilyId,
            BookingId   = booking.Id,
            ReportType  = ReportType.SafetyPlan,
            Title       = "Your Family Safety Plan — In Preparation",
            Description = "Our advisors are reviewing your assessment results and personalising your family safety plan. You will receive a detailed report and a tailored checklist shortly.",
            FileUrl     = null,
            GeneratedAt = DateTimeOffset.UtcNow,
        });

        // ── Priority checklist items ──────────────────────────────────────────

        AddItem(context, 1,
            "Set up a family password manager",
            "A password manager generates and securely stores unique passwords so no two accounts share the same credential.",
            ChecklistCategory.AccountSecurity, priority: 1);

        AddItem(context, 2,
            "Enable two-factor authentication on all critical accounts",
            "Cover email, banking, government services, and cloud storage as a minimum.",
            ChecklistCategory.AccountSecurity, priority: 1);

        AddItem(context, 3,
            "Enable screen lock on all family devices",
            "Set a strong PIN, pattern, or biometric lock on every phone, tablet, and laptop used by the family.",
            ChecklistCategory.DeviceHygiene, priority: 1);

        AddItem(context, 4,
            "Review and restrict app permissions on all mobile devices",
            "Revoke access to location, camera, and microphone for any app that does not need it.",
            ChecklistCategory.PrivacySharing, priority: 2);

        AddItem(context, 5,
            "Create an encrypted backup of important family documents",
            "Store passports, birth certificates, insurance, and financial records in a secure cloud location.",
            ChecklistCategory.BackupRecovery, priority: 2);

        // ── Safety task generation ─────────────────────────────────────────────

        var genContext = new TaskGenerationContext
        {
            FamilyId          = booking.FamilyId,
            BookingId         = booking.Id,
            Accounts          = context.Accounts,
            Devices           = context.Devices,
            FamilyPersons     = context.FamilyPersons,
            TriggeredByUserId = null,
        };

        var specs = FamilySafetyPlanTaskRules.SelectSpecs(context, booking.Id);
        return await taskGenerationService.GenerateAsync(genContext, specs, ct);
    }

    // ── Content generators ────────────────────────────────────────────────────

    private static string GenerateTopRisks(Assessment? assessment)
    {
        if (assessment is null)
        {
            return
                "A digital safety assessment has not yet been completed for your family.\n\n" +
                "Complete the SafeFamily assessment to receive a personalised risk report. " +
                "Your advisor will also identify key risk areas during consultation.";
        }

        var categories = new[]
        {
            (assessment.AccountSecurityScore, "Account Security",
                "Weak or reused passwords and missing two-factor authentication leave accounts vulnerable to credential-stuffing and takeover attacks."),
            (assessment.DeviceHygieneScore, "Device Hygiene",
                "Outdated operating systems and software create known vulnerabilities that attackers actively exploit."),
            (assessment.BackupRecoveryScore, "Backup & Recovery",
                "Without a reliable backup strategy your family risks permanent data loss from ransomware, accidental deletion, or device failure."),
            (assessment.PrivacySharingScore, "Privacy & Sharing",
                "Overshared personal information and excessive app permissions increase exposure to identity theft and social engineering."),
            (assessment.ScamReadinessScore, "Scam Readiness",
                "Family members who cannot recognise phishing and social engineering tactics are at high risk of financial fraud and credential theft."),
        };

        var risks = categories
            .Where(c => c.Item1 < 75)
            .OrderBy(c => c.Item1)
            .Take(3)
            .ToList();

        if (risks.Count == 0)
        {
            return
                $"Your family's digital safety profile is strong (overall score: {assessment.OverallScore}/100).\n\n" +
                "Your advisor will review for any remaining gaps and provide recommendations to sustain your current security posture.";
        }

        var sb = new StringBuilder();
        for (int i = 0; i < risks.Count; i++)
        {
            var (score, cat, description) = risks[i];
            sb.AppendLine($"{i + 1}. {cat} — Score: {score}/100");
            sb.AppendLine(description);
            if (i < risks.Count - 1) sb.AppendLine();
        }

        return sb.ToString().TrimEnd();
    }

    private static string GenerateTopPriorities(Assessment? assessment)
    {
        var priorities = new List<(string title, string reason)>();

        if (assessment is not null)
        {
            if (assessment.AccountSecurityScore < 65)
                priorities.Add((
                    "Enable two-factor authentication on all critical accounts",
                    "2FA stops account takeover attacks even when passwords are stolen or leaked in a breach."));

            if (assessment.DeviceHygieneScore < 65)
                priorities.Add((
                    "Enable automatic software updates on all family devices",
                    "Security patches close known vulnerabilities — delays leave devices exposed to publicly documented exploits."));

            if (assessment.BackupRecoveryScore < 65)
                priorities.Add((
                    "Set up automated cloud backups for all devices",
                    "A reliable backup means your family can recover from ransomware, theft, or accidental data loss."));

            if (assessment.PrivacySharingScore < 65)
                priorities.Add((
                    "Audit app permissions and social media privacy settings",
                    "Removing unnecessary access reduces your family's exposure to data harvesting and targeted scams."));

            if (assessment.ScamReadinessScore < 65)
                priorities.Add((
                    "Complete the family scam awareness checklist",
                    "Practical exercises help every family member recognise and resist phishing and social engineering attempts."));
        }

        // Password manager is always a foundational priority if list is thin
        if (priorities.Count < 3)
            priorities.Insert(0, (
                "Set up a family password manager",
                "A password manager generates and stores unique passwords for every account, eliminating the risks of password reuse across services."));

        var top3 = priorities.Take(3).ToList();
        var sb   = new StringBuilder();
        sb.AppendLine("Your advisor recommends focusing on these priorities in the next 30 days:");
        sb.AppendLine();

        for (int i = 0; i < top3.Count; i++)
        {
            var (title, reason) = top3[i];
            sb.AppendLine($"Priority {i + 1} — {title}");
            sb.AppendLine(reason);
            if (i < top3.Count - 1) sb.AppendLine();
        }

        return sb.ToString().TrimEnd();
    }

    private static string GenerateActionPlanByMember(
        IReadOnlyList<FamilyPerson> persons,
        Assessment? assessment)
    {
        if (persons.Count == 0)
        {
            return
                "No family member profiles have been added yet.\n\n" +
                "Add family member profiles under Family Members to receive a personalised " +
                "action plan tailored to each person's age group and digital ecosystem.";
        }

        var sections = persons.Select(p => BuildMemberSection(p));
        return string.Join("\n\n---\n\n", sections);
    }

    private static string BuildMemberSection(FamilyPerson person)
    {
        var actions = GetAgeGroupActions(person.AgeGroup, person.PrimaryEcosystem);
        var sb      = new StringBuilder();

        sb.AppendLine($"## {person.DisplayName} ({person.Relationship})");
        if (!string.IsNullOrWhiteSpace(person.PrimaryEcosystem))
            sb.AppendLine($"Primary ecosystem: {person.PrimaryEcosystem}");

        sb.AppendLine();
        foreach (var action in actions)
            sb.AppendLine($"• {action}");

        return sb.ToString().TrimEnd();
    }

    private static IReadOnlyList<string> GetAgeGroupActions(AgeGroup ageGroup, string? ecosystem)
    {
        var actions = ageGroup switch
        {
            AgeGroup.Infant => new[]
            {
                "Ensure all connected baby monitors use strong, unique passwords with firmware updates enabled",
                "Review parental control settings on every device the child has access to",
                "Disable location metadata on photos before uploading to any social media platform",
            },
            AgeGroup.Child => new[]
            {
                "Set up supervised accounts with Family Sharing (Apple) or Family Link (Google)",
                "Apply screen time limits and content filters appropriate to the child's age",
                "Restrict which apps and games can be downloaded without parental approval",
                "Enable SafeSearch and restricted modes on all browsers and streaming services",
                "Talk openly about not sharing personal information, photos, or location with strangers online",
            },
            AgeGroup.Teen => new[]
            {
                "Review privacy settings on Instagram, TikTok, Snapchat, and all other social platforms — set to private",
                "Audit which apps have access to location, camera, microphone, and contacts and revoke unnecessary permissions",
                "Enable two-factor authentication on primary email and social accounts",
                "Replace weak or reused passwords with a password manager",
                "Discuss phishing, romance scams, and social engineering tactics — teens are a primary target group",
            },
            AgeGroup.Senior => new[]
            {
                "Set up two-factor authentication with a trusted family member registered as recovery contact",
                "Register all phone numbers with the Do Not Call registry to reduce scam call volume",
                "Learn to identify the three most common scam types: urgent payment requests, fake tech support, and fake prize notifications",
                "Never share banking details, passwords, or government ID numbers over the phone or via unexpected messages",
                "Install a reputable security app and enable automatic updates on all devices",
            },
            _ => new[] // Adult (default)
            {
                "Enable two-factor authentication on email, banking, government, and cloud accounts",
                "Use a password manager to create and store unique passwords for every account",
                "Review connected third-party apps and revoke access to any you no longer use",
                "Enable new sign-in alerts so you are notified immediately of any unauthorised access attempts",
                "Keep all devices and software updated with automatic updates enabled",
            },
        };

        // Append ecosystem-specific action
        var eco    = ecosystem?.Trim().ToLowerInvariant() ?? string.Empty;
        var ecoTip = eco switch
        {
            var s when s.Contains("apple") || s.Contains("ios") || s.Contains("mac") =>
                "Review Apple ID trusted devices and enable Advanced Data Protection at appleid.apple.com",
            var s when s.Contains("google") || s.Contains("android") =>
                "Check connected apps and active sessions in Google Account security at myaccount.google.com",
            var s when s.Contains("microsoft") || s.Contains("windows") =>
                "Review recent sign-in activity and enable passwordless sign-in at account.microsoft.com",
            _ => null,
        };

        return ecoTip is not null ? [.. actions, ecoTip] : actions;
    }

    private static string GenerateActionPlanByDevice()
    {
        return
            "Review and secure all family devices using the following guidance.\n\n" +

            "All Devices\n" +
            "• Verify screen lock is enabled (PIN, fingerprint, or face unlock) on every phone, tablet, and computer\n" +
            "• Enable automatic software updates so security patches are applied promptly\n" +
            "• Uninstall apps and browser extensions you no longer use\n\n" +

            "Laptops & Computers\n" +
            "• Enable full-disk encryption — FileVault on macOS, BitLocker on Windows\n" +
            "• Configure automated backups — Time Machine, iCloud Drive, or a dedicated cloud backup service\n" +
            "• Disable auto-login on shared or portable machines\n" +
            "• Install a reputable security suite and keep it updated\n\n" +

            "Mobile Devices\n" +
            "• Enable remote wipe — Find My for Apple, Find My Device for Android/Google\n" +
            "• Audit app permissions: revoke location, camera, and microphone access for apps that do not need them\n" +
            "• Turn off Bluetooth and Wi-Fi auto-connect when in public places\n" +
            "• Enable encrypted backup to iCloud or Google One\n\n" +

            "Home Network\n" +
            "• Change your router's default admin password to a strong, unique passphrase\n" +
            "• Use WPA3 or WPA2-AES encryption on your home Wi-Fi network\n" +
            "• Create a separate guest network for smart home devices and visitors";
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private void AddItem(
        FulfillmentContext context, int index,
        string title, string description,
        ChecklistCategory category, int priority,
        DateTimeOffset? dueAt = null)
    {
        var sourceId = $"family-plan:{context.Booking.Id}:{index}";
        if (context.ExistingChecklistSourceIds.Contains(sourceId)) return;

        db.ChecklistItems.Add(new ChecklistItem
        {
            FamilyId        = context.Booking.FamilyId,
            Title           = title,
            Description     = description,
            Category        = category,
            Status          = ChecklistItemStatus.Pending,
            Priority        = priority,
            Phase           = priority == 1 ? SafeTaskPhase.Next7Days : SafeTaskPhase.Next30Days,
            SourceType      = ChecklistSourceType.FamilySafetyPlan,
            SourceId        = sourceId,
            SourceBookingId = context.Booking.Id,
            IsPremium       = true,
            DueAt           = dueAt,
        });
    }
}
