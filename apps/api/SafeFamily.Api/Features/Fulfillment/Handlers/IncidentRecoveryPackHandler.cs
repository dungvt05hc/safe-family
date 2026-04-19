using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Checklists;
using SafeFamily.Api.Domain.Incidents;
using SafeFamily.Api.Domain.Plans;
using SafeFamily.Api.Domain.Reports;
using SafeFamily.Api.Features.Tasks.Generation;

namespace SafeFamily.Api.Features.Fulfillment.Handlers;

/// <summary>
/// Fulfillment handler for the INCIDENT-RESP package.
///
/// Creates an <see cref="IncidentRecoveryPack"/> with five structured guidance sections
/// generated from per-incident-type templates, links it to the source incident when
/// available, produces time-sensitive follow-up checklist items, and generates
/// phase-based safety tasks via <see cref="IncidentRecoveryPackTaskRules"/>.
/// </summary>
public sealed class IncidentRecoveryPackHandler(
    AppDbContext db,
    ISafetyTaskGenerationService taskGenerationService) : IPackageFulfillmentHandler
{
    // ── Template data ─────────────────────────────────────────────────────────

    private sealed record IncidentTemplate(
        string WhatHappened,
        string WhatToDoNow,
        string WhatNotToDo,
        string Next24Hours,
        string Next7Days,
        IReadOnlyList<(string title, string description, ChecklistCategory category, int dueDays)> FollowUpTasks);

    private static readonly Dictionary<IncidentType, IncidentTemplate> s_templates = new()
    {
        [IncidentType.PhishingAttempt] = new(
            WhatHappened:
                "A family member received a fraudulent message designed to look like it came from a trusted source — " +
                "such as a bank, government agency, or familiar company. The goal was to trick you into clicking a link, " +
                "opening an attachment, or revealing personal information or credentials.",

            WhatToDoNow:
                "• Do not interact further with the message — do not click, reply, or call any numbers in it\n" +
                "• If you entered any credentials, change those passwords immediately — start with your email account\n" +
                "• Report the message to your email provider (use the 'Report phishing' option) or forward SMS to 7726 (SPAM)\n" +
                "• If banking credentials were entered, call your bank's fraud line now",

            WhatNotToDo:
                "• Do not reply to the sender under any circumstances\n" +
                "• Do not call any phone numbers listed in the message — they connect to the attacker\n" +
                "• Do not open attachments even if they appear to be from someone you know\n" +
                "• Do not assume the threat has passed because you did not enter information — simply clicking can sometimes trigger malware",

            Next24Hours:
                "1. Change passwords on your email account first, then banking, then social media and any shared accounts\n" +
                "2. Enable login alerts on your primary email and banking accounts\n" +
                "3. Check your email account settings for unexpected forwarding rules added without your knowledge\n" +
                "4. Run a security scan on the device you used when you received the message",

            Next7Days:
                "1. Check haveibeenpwned.com with all family email addresses to identify exposed credentials\n" +
                "2. Review your email account's recent sign-in history for any unfamiliar locations\n" +
                "3. Enable two-factor authentication on your email account if not already active\n" +
                "4. Brief other family members on how to recognise phishing messages — forward them a summary",

            FollowUpTasks:
            [
                ("Change password on primary email account",
                    "Your email is the recovery point for all other accounts — secure it first.",
                    ChecklistCategory.AccountSecurity, 1),
                ("Enable login alerts on email and banking accounts",
                    "Turn on notifications for new sign-ins so you are immediately aware of any further unauthorised access attempts.",
                    ChecklistCategory.AccountSecurity, 3),
                ("Check email settings for unexpected forwarding rules",
                    "Attackers often add silent forwarding rules to receive copies of your messages even after you change your password.",
                    ChecklistCategory.AccountSecurity, 1),
                ("Run a credentials check on haveibeenpwned.com",
                    "Enter all family email addresses to find out which breach datasets contain your credentials.",
                    ChecklistCategory.AccountSecurity, 7),
            ]
        ),

        [IncidentType.PasswordCompromise] = new(
            WhatHappened:
                "One or more of your family's account passwords has been compromised. This can occur through a data breach " +
                "at a company you have an account with, malware capturing keystrokes, a shared or public computer, " +
                "or through someone with physical access to your device.",

            WhatToDoNow:
                "• Change the compromised password immediately from a trusted, secure device\n" +
                "• Sign out of all active sessions on the affected platform\n" +
                "• Identify every other account that uses the same or similar password and change those too\n" +
                "• If banking credentials were involved, call your bank's fraud line now",

            WhatNotToDo:
                "• Do not use a variation of the old password — attackers test common variations automatically\n" +
                "• Do not delay — attackers typically act within minutes to hours of obtaining credentials\n" +
                "• Do not reuse the new password anywhere else\n" +
                "• Do not log in to the affected account from a shared or public computer until you are certain it is clean",

            Next24Hours:
                "1. Change passwords on all accounts sharing the compromised credential\n" +
                "2. Enable two-factor authentication on the compromised account\n" +
                "3. Review the account's recent sign-in history and activity log for any unauthorised actions\n" +
                "4. Check your email inbox for unexpected password reset or account recovery emails",

            Next7Days:
                "1. Audit all family passwords using a password manager — replace every weak or reused password\n" +
                "2. Check haveibeenpwned.com to identify which breach datasets contain your credentials\n" +
                "3. Enable two-factor authentication on your remaining critical accounts\n" +
                "4. Review saved passwords in all browsers and delete them in favour of the password manager",

            FollowUpTasks:
            [
                ("Change all passwords that share the compromised credential",
                    "Start with email and banking, then work through every account using the same password.",
                    ChecklistCategory.AccountSecurity, 1),
                ("Enable two-factor authentication on the affected account",
                    "2FA prevents sign-in even if the password is stolen again in a future breach.",
                    ChecklistCategory.AccountSecurity, 2),
                ("Review recent account activity for unauthorised actions",
                    "Check sign-in history, connected apps, and any changes made while the account was at risk.",
                    ChecklistCategory.AccountSecurity, 2),
                ("Set up a password manager and replace all reused passwords",
                    "Unique passwords for every account eliminate the risk of cascade compromise.",
                    ChecklistCategory.AccountSecurity, 7),
            ]
        ),

        [IncidentType.DeviceLostOrStolen] = new(
            WhatHappened:
                "A family device — phone, tablet, or laptop — has been lost or stolen. The primary risk is " +
                "unauthorised access to accounts, personal files, stored passwords, and sensitive information " +
                "accessible from or saved on the device.",

            WhatToDoNow:
                "• Open Find My (Apple) or Find My Device (Android/Google) from another device and attempt to locate it\n" +
                "• If recovery is unlikely, trigger a remote wipe immediately to erase all data\n" +
                "• Change passwords for every account you were signed into on the lost device — starting with email and banking\n" +
                "• Contact your mobile carrier if the device has a SIM card to prevent SIM-based attacks",

            WhatNotToDo:
                "• Do not assume the screen lock is sufficient protection — sophisticated attackers can bypass it\n" +
                "• Do not wait to act — the longer the device is in unknown hands, the greater the data exposure\n" +
                "• Do not attempt to recover the device yourself if stolen — report to police and remote-wipe instead",

            Next24Hours:
                "1. Remote wipe the device if it cannot be recovered\n" +
                "2. Change passwords for critical accounts — email, banking, payment apps, company accounts\n" +
                "3. Contact your bank if mobile banking apps were installed and logged in\n" +
                "4. Report theft to police and obtain a report number (required for insurance)\n" +
                "5. Contact your carrier to suspend or report the SIM if applicable",

            Next7Days:
                "1. Review sign-in history on all accounts that were logged in on the device\n" +
                "2. Enable two-factor authentication on accounts that were accessible from the device\n" +
                "3. Revoke OAuth tokens for apps that were connected to your email or cloud accounts\n" +
                "4. Obtain a replacement device and restore from your most recent backup\n" +
                "5. Ensure the replacement device has full-disk encryption and screen lock enabled before restoring data",

            FollowUpTasks:
            [
                ("Remote wipe the lost device",
                    "Use Find My or Find My Device to erase all data before it falls into the wrong hands.",
                    ChecklistCategory.DeviceHygiene, 1),
                ("Change passwords on all accounts accessible from the device",
                    "Start with email and banking. Assume all accounts that were logged in are compromised.",
                    ChecklistCategory.AccountSecurity, 1),
                ("Report theft to police and obtain a report number",
                    "Required for insurance claims. Some carriers also require it to block the IMEI.",
                    ChecklistCategory.General, 2),
                ("Review sign-in history on all affected accounts",
                    "Check for any unauthorised access from the device's location or IP address.",
                    ChecklistCategory.AccountSecurity, 3),
                ("Enable device encryption and backups on replacement device",
                    "Ensure the same situation cannot occur again — full-disk encryption protects data if the replacement is also lost.",
                    ChecklistCategory.DeviceHygiene, 7),
            ]
        ),

        [IncidentType.UnauthorisedAccess] = new(
            WhatHappened:
                "Someone has gained or attempted to gain unauthorised access to one or more of your family's accounts or systems. " +
                "This is often achieved through stolen credentials, session hijacking, or exploitation of a weak recovery option.",

            WhatToDoNow:
                "• Terminate all active sessions on the affected account — use 'Sign out everywhere'\n" +
                "• Change the account password immediately from a secure, uncompromised device\n" +
                "• Enable two-factor authentication if it is not already active\n" +
                "• Review all account settings and recovery options — attackers often change these to maintain access",

            WhatNotToDo:
                "• Do not assume the attacker has left once you change the password — check for persistent access methods\n" +
                "• Do not keep any recovery phone number or email address that the attacker may control\n" +
                "• Do not use the same password on any other account",

            Next24Hours:
                "1. Terminate all active sessions and change the password\n" +
                "2. Review account recovery settings — remove any recovery email, phone, or trusted device you do not recognise\n" +
                "3. Check for email forwarding rules or filters added without your knowledge\n" +
                "4. Review recent activity log for any actions taken by the attacker",

            Next7Days:
                "1. Enable two-factor authentication on all accounts that the attacker could pivot to from the compromised account\n" +
                "2. Audit all connected apps and revoke OAuth tokens for services you did not authorise\n" +
                "3. Change passwords on related accounts that share credentials or recovery options\n" +
                "4. Consider placing a credit freeze if personal identifying information could have been accessed",

            FollowUpTasks:
            [
                ("Terminate all active sessions and change account password",
                    "Use 'Sign out of all devices' on the account settings page, then change the password immediately.",
                    ChecklistCategory.AccountSecurity, 1),
                ("Review and clean up account recovery settings",
                    "Remove any unrecognised recovery email addresses, phone numbers, or trusted devices.",
                    ChecklistCategory.AccountSecurity, 1),
                ("Check account activity log for actions taken by attacker",
                    "Review any emails sent, files accessed, settings changed, or purchases made during the breach window.",
                    ChecklistCategory.AccountSecurity, 2),
                ("Enable two-factor authentication across all related accounts",
                    "2FA prevents re-entry even if the attacker has retained the password.",
                    ChecklistCategory.AccountSecurity, 3),
            ]
        ),

        [IncidentType.DataBreach] = new(
            WhatHappened:
                "A company or service that holds your family's personal information has suffered a data breach, " +
                "exposing account details, passwords, payment information, or other personal data. " +
                "Your information may now be available for sale on the dark web or used in targeted attacks.",

            WhatToDoNow:
                "• Change the password for the breached service immediately\n" +
                "• If you used the same password elsewhere, change those accounts too\n" +
                "• Enable two-factor authentication on the breached account\n" +
                "• Monitor your email for unusual sign-in notifications or account recovery requests",

            WhatNotToDo:
                "• Do not ignore breach notifications from companies — take them seriously even if they seem minor\n" +
                "• Do not reuse the new password anywhere else\n" +
                "• Do not click any links in emails claiming to be from the breached company — navigate directly to the site",

            Next24Hours:
                "1. Change the password on the breached service and any accounts with the same credentials\n" +
                "2. Enable two-factor authentication on the affected accounts\n" +
                "3. Check haveibeenpwned.com to understand the full scope of your family's exposure\n" +
                "4. If payment card details were exposed, contact your bank to issue a replacement card",

            Next7Days:
                "1. Review all accounts using credentials similar to those exposed in the breach\n" +
                "2. Monitor bank and credit card statements for unauthorised transactions for the next 90 days\n" +
                "3. Consider placing a fraud alert or credit freeze with credit bureaus if personal identity information was exposed\n" +
                "4. Set up breach monitoring at haveibeenpwned.com so you receive alerts for future exposures",

            FollowUpTasks:
            [
                ("Change password on breached service and all accounts sharing that credential",
                    "Credential-stuffing attacks automatically try stolen passwords across thousands of other services.",
                    ChecklistCategory.AccountSecurity, 1),
                ("Enable 2FA on breached account and critical accounts",
                    "Two-factor authentication blocks attackers even when passwords are known.",
                    ChecklistCategory.AccountSecurity, 2),
                ("Check haveibeenpwned.com for full breach exposure",
                    "Enter all family email addresses to identify every breach dataset your credentials appear in.",
                    ChecklistCategory.AccountSecurity, 3),
                ("Monitor bank statements for unauthorised transactions",
                    "Review the last 90 days and set up real-time transaction alerts with your bank.",
                    ChecklistCategory.ScamReadiness, 7),
            ]
        ),

        [IncidentType.MalwareInfection] = new(
            WhatHappened:
                "A family device has been infected with malicious software. Malware can steal passwords and banking " +
                "credentials, encrypt files for ransom, use the device to attack others, or provide an attacker with " +
                "remote access to the device and everything connected to it.",

            WhatToDoNow:
                "• Disconnect the affected device from your home network immediately — turn off Wi-Fi and unplug Ethernet\n" +
                "• Do not use the device for banking, email, or any sensitive activity until it is clean\n" +
                "• Change passwords on accounts you have accessed from the infected device — from a different, clean device\n" +
                "• Run a full offline security scan using a trusted tool on the infected device",

            WhatNotToDo:
                "• Do not pay a ransom — it does not guarantee file recovery and funds further criminal activity\n" +
                "• Do not connect the infected device to other devices or external storage until it is confirmed clean\n" +
                "• Do not log into any accounts on the infected device before it is fully cleaned\n" +
                "• Do not assume antivirus removal is sufficient — some advanced malware survives removal and requires a full wipe",

            Next24Hours:
                "1. Isolate the device — turn off Wi-Fi and disconnect any cables\n" +
                "2. Change passwords for all accounts accessed on the device, from a clean device\n" +
                "3. Run a full offline security scan or boot from an external rescue disk\n" +
                "4. If ransomware: do not pay — check nomoreransom.org for free decryption tools",

            Next7Days:
                "1. If the infection cannot be fully removed, perform a factory reset and restore from a pre-infection backup\n" +
                "2. Enable two-factor authentication on all critical accounts\n" +
                "3. Change passwords on all other devices on the same home network — they may also be compromised\n" +
                "4. Install and configure a reputable security suite on the cleaned or replaced device\n" +
                "5. Review your home router settings for any changes made without your knowledge",

            FollowUpTasks:
            [
                ("Isolate infected device from the network",
                    "Disconnect Wi-Fi and Ethernet to prevent the malware from spreading to other devices.",
                    ChecklistCategory.DeviceHygiene, 1),
                ("Change passwords for all accounts accessed on infected device",
                    "Assume all credentials typed on the infected device have been captured by the malware.",
                    ChecklistCategory.AccountSecurity, 1),
                ("Run full security scan or factory reset infected device",
                    "A factory reset with a clean OS install is the only guaranteed way to remove persistent malware.",
                    ChecklistCategory.DeviceHygiene, 3),
                ("Enable 2FA on all critical accounts",
                    "Even if credentials were stolen, 2FA prevents sign-in without the second factor.",
                    ChecklistCategory.AccountSecurity, 3),
                ("Review home router settings for unauthorised changes",
                    "Some malware modifies router DNS settings to redirect traffic — check your router admin panel.",
                    ChecklistCategory.DeviceHygiene, 7),
            ]
        ),

        [IncidentType.ScamOrFraud] = new(
            WhatHappened:
                "A family member has been targeted by or fallen victim to a financial scam or fraudulent scheme. " +
                "This includes investment fraud, fake tech support calls, impersonation scams (bank, police, ATO/IRS), " +
                "romance scams, lottery scams, and advance-fee fraud.",

            WhatToDoNow:
                "• Do not send any further money — no legitimate organisation will ask for more payments to resolve ongoing fraud\n" +
                "• If a payment was made: contact your bank immediately to recall the transfer and freeze the account\n" +
                "• Preserve all evidence: screenshots, emails, phone numbers, transaction receipts\n" +
                "• If you provided personal details: check your credit report for any new accounts or applications",

            WhatNotToDo:
                "• Do not send gift cards, wire transfers, or cryptocurrency — these are irreversible and favoured by scammers\n" +
                "• Do not be embarrassed — scammers are professionals and target all age groups\n" +
                "• Do not engage further with the scammer even to confront them — they may escalate threats",

            Next24Hours:
                "1. Contact your bank immediately if any financial transfer was made\n" +
                "2. Document everything — screenshots, names, phone numbers, email addresses used\n" +
                "3. Report the scam to your national consumer protection body (ACCC ScamWatch, Action Fraud, FTC etc.)\n" +
                "4. Alert other family members — some scammers target multiple members of the same family",

            Next7Days:
                "1. Review your credit report for any new applications or accounts you did not open\n" +
                "2. Change passwords on any accounts where you shared credentials with the scammer\n" +
                "3. Block and report the scammer's contact details on all platforms used\n" +
                "4. Consider identity theft protection services if extensive personal information was shared\n" +
                "5. Brief all family members on the scam type so they can recognise it in future",

            FollowUpTasks:
            [
                ("Contact your bank to report and attempt to reverse any transactions",
                    "Banks can sometimes recall wire transfers if reported quickly — call the fraud line immediately.",
                    ChecklistCategory.ScamReadiness, 1),
                ("Report the scam to your national fraud reporting authority",
                    "Reporting helps authorities track patterns and warn others. It also creates a formal record.",
                    ChecklistCategory.ScamReadiness, 2),
                ("Check your credit report for unauthorised applications",
                    "Scammers with your personal details may attempt to open credit accounts in your name.",
                    ChecklistCategory.ScamReadiness, 7),
                ("Brief all family members on this scam type",
                    "Awareness is the best defence — share the details with every family member.",
                    ChecklistCategory.ScamReadiness, 3),
            ]
        ),

        [IncidentType.IdentityTheft] = new(
            WhatHappened:
                "A family member's personal identity information has been stolen and may be used to open fraudulent " +
                "accounts, obtain credit, file false tax returns, claim benefits, or impersonate them to commit other crimes.",

            WhatToDoNow:
                "• Place a fraud alert with all major credit bureaus immediately — this is free and makes it harder to open new accounts\n" +
                "• Contact your bank and any financial institutions to flag the issue\n" +
                "• Report identity theft to your national authority (IdentityTheft.gov in the US, ACCC in Australia etc.)\n" +
                "• If your government-issued ID was compromised, contact the relevant agency to invalidate and replace it",

            WhatNotToDo:
                "• Do not ignore it — identity theft compounds over time and becomes harder to undo\n" +
                "• Do not throw away any documentation related to the fraud\n" +
                "• Do not give out additional personal information to anyone claiming to help resolve it — verify all callers independently",

            Next24Hours:
                "1. Place a fraud alert with major credit bureaus (Equifax, Experian, TransUnion or local equivalents)\n" +
                "2. Request your credit reports and review them for unfamiliar accounts or inquiries\n" +
                "3. Contact any financial institutions where you believe fraudulent accounts may have been opened\n" +
                "4. File a formal identity theft report with your national authority\n" +
                "5. Change passwords on all financial and government service accounts",

            Next7Days:
                "1. Contact each organisation where fraudulent accounts were opened and dispute them\n" +
                "2. Consider placing a credit freeze (stronger than a fraud alert) with all credit bureaus\n" +
                "3. Replace any government-issued ID that was involved\n" +
                "4. Set up ongoing credit monitoring — many banks and services offer this for free\n" +
                "5. Keep a detailed log of all actions taken and correspondence — you will need this for dispute resolution",

            FollowUpTasks:
            [
                ("Place a fraud alert with all major credit bureaus",
                    "A fraud alert requires lenders to take extra steps to verify your identity before opening new accounts.",
                    ChecklistCategory.ScamReadiness, 1),
                ("Review credit reports for unauthorised accounts",
                    "Request free credit reports and search for accounts, loans, or inquiries you did not make.",
                    ChecklistCategory.ScamReadiness, 2),
                ("File an official identity theft report",
                    "A formal report is required to dispute fraudulent accounts and provides legal protections.",
                    ChecklistCategory.ScamReadiness, 2),
                ("Replace any government-issued identification that was compromised",
                    "Contact the relevant issuing authority to invalidate and reissue affected IDs.",
                    ChecklistCategory.General, 7),
            ]
        ),

        [IncidentType.SocialEngineering] = new(
            WhatHappened:
                "An attacker has manipulated a family member psychologically to gain access to information, " +
                "accounts, or premises — without relying on technical hacking. Social engineering exploits trust, " +
                "urgency, authority, and fear to bypass normal security caution.",

            WhatToDoNow:
                "• Stop all communication with the person immediately\n" +
                "• Change passwords on any accounts, systems, or services that were involved or referenced\n" +
                "• Alert any organisation the attacker impersonated — they need to know their brand is being used\n" +
                "• If physical access was granted, change locks, access codes, or security measures immediately",

            WhatNotToDo:
                "• Do not feel embarrassed — social engineering is effective against even security professionals\n" +
                "• Do not engage further with the attacker\n" +
                "• Do not assume the damage was limited to what was directly discussed",

            Next24Hours:
                "1. Document everything — save all messages, note all details about calls or interactions\n" +
                "2. Change all credentials that were referenced or potentially accessed\n" +
                "3. Brief all household members about the specific tactic used so it cannot be repeated\n" +
                "4. Report to your company's security team if the attack targeted work systems",

            Next7Days:
                "1. Review all accounts for any access or changes that occurred during the period of manipulation\n" +
                "2. Conduct a family discussion about social engineering tactics — scripts, expected pretexts, when to verify\n" +
                "3. Set up a family code phrase for high-urgency requests so members can verify authenticity\n" +
                "4. Enable two-factor authentication across all accounts to prevent future phone-based account takeover",

            FollowUpTasks:
            [
                ("Change all credentials referenced or potentially exposed",
                    "Assume any account mentioned or demonstrated during the social engineering attempt has been compromised.",
                    ChecklistCategory.AccountSecurity, 1),
                ("Brief all family members on the specific tactic used",
                    "The same tactic will likely be re-attempted — awareness is the most effective countermeasure.",
                    ChecklistCategory.ScamReadiness, 2),
                ("Enable two-factor authentication on all critical accounts",
                    "2FA prevents phone-based account takeover even when an attacker successfully tricks support staff.",
                    ChecklistCategory.AccountSecurity, 3),
                ("Establish a family code word for urgent requests",
                    "A shared secret phrase allows family members to verify the authenticity of high-pressure requests.",
                    ChecklistCategory.ScamReadiness, 7),
            ]
        ),
    };

    // Fallback template used when incident type is Other or has no specific template
    private static readonly IncidentTemplate s_genericTemplate = new(
        WhatHappened:
            "A digital security incident has been reported for your family. Your SafeFamily advisor will review " +
            "the full details you provided and personalise this recovery plan based on your specific situation.",

        WhatToDoNow:
            "• Change passwords on any accounts you believe may be at risk\n" +
            "• Enable two-factor authentication where it is not already active\n" +
            "• Contact your bank if any financial accounts or payment details could be involved",

        WhatNotToDo:
            "• Do not ignore the situation — digital incidents compound quickly without action\n" +
            "• Do not reuse compromised passwords\n" +
            "• Do not discuss details of the incident on social media",

        Next24Hours:
            "1. Change passwords on any potentially affected accounts\n" +
            "2. Enable two-factor authentication on critical accounts\n" +
            "3. Document everything you know about the incident while details are fresh",

        Next7Days:
            "1. Complete the follow-up checklist items created for your booking\n" +
            "2. Review all family accounts for unusual activity\n" +
            "3. Your advisor will provide more specific guidance once they have reviewed your case",

        FollowUpTasks:
        [
            ("Change passwords on all potentially affected accounts",
                "Start with email and banking, then any account that may have been exposed.",
                ChecklistCategory.AccountSecurity, 1),
            ("Enable two-factor authentication on critical accounts",
                "2FA prevents sign-in even if passwords have been compromised.",
                ChecklistCategory.AccountSecurity, 3),
            ("Document and preserve all evidence of the incident",
                "Screenshots, messages, and records will be needed for any reports or insurance claims.",
                ChecklistCategory.General, 2),
            ("Review all family accounts for unauthorised activity",
                "Check sign-in history, connected apps, and recent transactions across all accounts.",
                ChecklistCategory.AccountSecurity, 7),
        ]
    );

    // ── Handler ───────────────────────────────────────────────────────────────

    public async Task<TaskGenerationResult?> PrepareAsync(FulfillmentContext context, CancellationToken ct = default)
    {
        var booking  = context.Booking;
        var incident = context.LinkedIncident;

        var template = incident is not null && s_templates.TryGetValue(incident.Type, out var t)
            ? t
            : s_genericTemplate;

        // Derive WhatHappened: enrich template with incident-specific context if available
        var whatHappened = BuildWhatHappened(template.WhatHappened, incident, booking);

        db.IncidentRecoveryPacks.Add(new IncidentRecoveryPack
        {
            FamilyId         = booking.FamilyId,
            BookingId        = booking.Id,
            LinkedIncidentId = incident?.Id,
            WhatHappened     = whatHappened,
            WhatToDoNow      = template.WhatToDoNow,
            WhatNotToDo      = template.WhatNotToDo,
            Next24Hours      = template.Next24Hours,
            Next7Days        = template.Next7Days,
            Status           = PlanStatus.Generated,
        });

        db.Reports.Add(new Report
        {
            FamilyId    = booking.FamilyId,
            BookingId   = booking.Id,
            IncidentId  = incident?.Id,
            ReportType  = ReportType.IncidentRecovery,
            Title       = "Your Incident Recovery Plan — In Preparation",
            Description = "Our advisors are reviewing your incident details and preparing a targeted recovery plan. Priority follow-up tasks are now in your checklist.",
            FileUrl     = null,
            GeneratedAt = DateTimeOffset.UtcNow,
        });

        // Create follow-up tasks from the template
        for (int i = 0; i < template.FollowUpTasks.Count; i++)
        {
            var (title, description, category, dueDays) = template.FollowUpTasks[i];
            AddItem(context, i + 1, title, description, category,
                priority: 1, dueAt: DateTimeOffset.UtcNow.AddDays(dueDays));
        }

        // ── Phase-based safety task generation ───────────────────────────────
        // Generates all four phase groups (immediate / guidance / 24h / 7-day)
        // plus per-account and per-device supplementary tasks via
        // IncidentRecoveryPackTaskRules.SelectSpecs.

        var genContext = new TaskGenerationContext
        {
            FamilyId          = booking.FamilyId,
            BookingId         = booking.Id,
            IncidentId        = incident?.Id,
            Accounts          = context.Accounts,
            Devices           = context.Devices,
            FamilyPersons     = context.FamilyPersons,
            TriggeredByUserId = null,
        };

        var specs = IncidentRecoveryPackTaskRules.SelectSpecs(context, booking.Id);
        return await taskGenerationService.GenerateAsync(genContext, specs, ct);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static string BuildWhatHappened(string baseText, Incident? incident, Domain.Bookings.Booking booking)
    {
        if (incident is null)
        {
            // No linked incident — use booking context if available
            var context = !string.IsNullOrWhiteSpace(booking.HelpTopic)
                ? $"\n\nBooking context: {booking.HelpTopic}"
                : string.Empty;
            return baseText + context;
        }

        // Enrich with actual incident data
        var parts = new System.Text.StringBuilder(baseText);
        parts.AppendLine();
        parts.AppendLine();
        parts.Append($"Incident reported: {incident.Type.ToString().Replace("Or", " or ").Replace("And", " and ")}");

        if (incident.Severity >= IncidentSeverity.High)
            parts.Append($" — {incident.Severity} severity");

        if (!string.IsNullOrWhiteSpace(incident.Summary))
        {
            parts.AppendLine();
            parts.AppendLine();
            parts.AppendLine("Details from incident report:");
            parts.Append(incident.Summary);
        }

        return parts.ToString();
    }

    private void AddItem(
        FulfillmentContext context, int index,
        string title, string description,
        ChecklistCategory category, int priority,
        DateTimeOffset? dueAt = null)
    {
        var sourceId = $"incident-pack:{context.Booking.Id}:{index}";
        if (context.ExistingChecklistSourceIds.Contains(sourceId)) return;

        db.ChecklistItems.Add(new ChecklistItem
        {
            FamilyId        = context.Booking.FamilyId,
            Title           = title,
            Description     = description,
            Category        = category,
            Status          = ChecklistItemStatus.Pending,
            Priority        = priority,
            Phase           = priority == 1 ? SafeTaskPhase.Immediate : SafeTaskPhase.Next7Days,
            SourceType      = ChecklistSourceType.IncidentRecoveryPack,
            SourceId        = sourceId,
            SourceBookingId = context.Booking.Id,
            IsPremium       = true,
            DueAt           = dueAt,
        });
    }
}
