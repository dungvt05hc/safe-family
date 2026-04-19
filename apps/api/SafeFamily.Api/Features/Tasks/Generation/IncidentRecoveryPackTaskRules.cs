using SafeFamily.Api.Domain.Accounts;
using SafeFamily.Api.Domain.Devices;
using SafeFamily.Api.Domain.Incidents;
using SafeFamily.Api.Domain.Tasks;
using SafeFamily.Api.Features.Fulfillment;

namespace SafeFamily.Api.Features.Tasks.Generation;

/// <summary>
/// Rule definitions and phase-based task generation for the Incident Recovery Pack
/// (INCIDENT-RESP) product.
///
/// <para>
/// <b>Four delivery phases</b>
/// <list type="number">
///   <item><b>Immediate</b> — critical actions to take right now (High priority, <see cref="TaskPhase.Immediate"/>, sort 1–9)</item>
///   <item><b>Guidance</b> — "what not to do" advisory items (Low priority, <see cref="TaskPhase.Immediate"/>, sort 10–19).
///         Titles are prefixed with <c>⚠ Avoid:</c> so the UI can render them distinctly.</item>
///   <item><b>Short-term</b> — actions required within the next 24 hours (Medium/High priority, <see cref="TaskPhase.Immediate"/>, sort 20–29)</item>
///   <item><b>Long-term</b> — recovery tasks to complete over the next 7 days (<see cref="TaskPhase.Next7Days"/>, sort 30–39)</item>
/// </list>
/// </para>
///
/// <para>
/// Incident-type–specific templates drive task selection. A generic fallback set covers
/// <see cref="IncidentType.Other"/> and any unlisted types. Severity escalation promotes
/// short-term tasks from Medium to High priority for High and Critical incidents.
/// </para>
///
/// <para>
/// Account- and device-linked supplementary tasks (sort 50+) are appended when the
/// fulfillment context includes concrete entities — e.g., remote wipe per lost device,
/// 2FA per account without it enabled.
/// </para>
/// </summary>
internal static class IncidentRecoveryPackTaskRules
{
    private const string Slug = GenerationKeyStrategy.ProductSlugIncidentRecoveryPack;

    // ── Template data types ───────────────────────────────────────────────────

    /// <summary>
    /// Single task definition within a phase template.
    /// <see cref="KeySuffix"/> is combined with the incident (or booking) Guid at spec-build time
    /// to produce a stable, idempotent generation key.
    /// </summary>
    private sealed record PhaseTask(
        string KeySuffix,
        string Title,
        string Description,
        string WhyThisMatters,
        TaskCategory Category,
        string? GuidanceMarkdown = null,
        string? HelpLink = null);

    private sealed record IncidentTaskTemplate(
        PhaseTask[] Immediate,
        PhaseTask[] Guidance,
        PhaseTask[] ShortTerm,
        PhaseTask[] LongTerm);

    // ── Per-incident-type templates ───────────────────────────────────────────

    private static readonly Dictionary<IncidentType, IncidentTaskTemplate> s_templates = new()
    {
        // ── Phishing attempt ─────────────────────────────────────────────────
        [IncidentType.PhishingAttempt] = new(

            Immediate:
            [
                new("report_phishing_message",
                    "Report the phishing message to your provider",
                    "Report the fraudulent message to your email provider or forward the SMS to 7726 (SPAM). " +
                    "If banking credentials were entered, call your bank's fraud line now.",
                    "Reporting helps providers block the sender and protects others from the same message. " +
                    "Calling your bank immediately can stop fraudulent transactions before they clear.",
                    TaskCategory.ScamReadiness,
                    GuidanceMarkdown:
                        "**Email**: Use the 'Report phishing' or 'Report spam' option in your provider\n\n" +
                        "**SMS**: Forward the message to 7726 (SPAM) — free on most carriers\n\n" +
                        "**Banking**: Do not use the number in the message — call the number on the back of your card"),

                new("sign_out_entry_sessions",
                    "Sign out of all active sessions on any account where credentials may have been entered",
                    "If you clicked a link and entered a username, password, or code, treat that account as compromised " +
                    "and terminate all sessions immediately.",
                    "Signing out all sessions revokes any access the attacker gained the moment you submitted your credentials. " +
                    "Doing this before changing the password is often the faster path to stopping active access.",
                    TaskCategory.AccountSecurity,
                    GuidanceMarkdown:
                        "1. Go to **Settings → Security → Active sessions** (or 'Where you're signed in')\n" +
                        "2. Select **Sign out of all other sessions**\n" +
                        "3. Immediately change your password after signing out"),
            ],

            Guidance:
            [
                new("avoid_replying_to_sender",
                    "⚠ Avoid: Replying to or calling back the sender",
                    "Do not reply, click reply-to links, or call any number listed in the message. Any response confirms your address is active and may escalate the attack.",
                    "Engaging with the sender signals that your address is monitored, leading to more targeted attacks.",
                    TaskCategory.ScamReadiness),

                new("avoid_clicking_attachments",
                    "⚠ Avoid: Clicking links or opening attachments in the message",
                    "Even after initial interaction, do not go back to click anything. Some links install malware on click, not just on credential submission.",
                    "A single click on a malicious attachment can silently install credential-harvesting software.",
                    TaskCategory.ScamReadiness),

                new("avoid_sensitive_on_device",
                    "⚠ Avoid: Banking or sensitive account activity on this device until it is scanned",
                    "If you clicked a link, the device may have been exposed to malicious code. Avoid logging into financial or critical accounts on it until you have run a security scan.",
                    "Using a potentially compromised device for banking extends the window of exposure.",
                    TaskCategory.DeviceHygiene),
            ],

            ShortTerm:
            [
                new("change_email_banking_passwords",
                    "Change passwords on your email and banking accounts",
                    "Email is the recovery gateway for all other accounts. Change it first, then banking, then any other account you accessed recently from this device.",
                    "If the attacker captured your email password, they can use it to reset every other account you own.",
                    TaskCategory.AccountSecurity,
                    GuidanceMarkdown:
                        "1. From a different, trusted device if possible\n" +
                        "2. Use a password manager to generate a strong, unique password\n" +
                        "3. Do not reuse any previous password or a minor variation of it"),

                new("enable_login_alerts",
                    "Enable login alert notifications on your primary accounts",
                    "Turn on notifications for new sign-in attempts on your email, banking, and social media accounts so you are immediately alerted to any further unauthorised access.",
                    "Login alerts give you real-time visibility. Without them, an attacker can access your account repeatedly without your knowledge.",
                    TaskCategory.AccountSecurity),

                new("check_email_forwarding_rules",
                    "Check your email settings for unexpected forwarding rules or filters",
                    "Review your email account settings for forwarding rules, filters, or delegates added without your knowledge. Attackers add these to receive silent copies of your emails.",
                    "A hidden forwarding rule means the attacker continues to receive your emails even after you change the password and kick out the session.",
                    TaskCategory.AccountSecurity,
                    GuidanceMarkdown:
                        "**Gmail**: Settings → See all settings → Filters and Blocked Addresses / Forwarding and POP/IMAP\n\n" +
                        "**Outlook**: Settings → Mail → Rules / Forwarding"),
            ],

            LongTerm:
            [
                new("check_breach_exposure",
                    "Check all family email addresses for known data breaches",
                    "Visit haveibeenpwned.com with every family email address to find out if your credentials have been exposed in known breach datasets.",
                    "Phishing attacks frequently use stolen breach data. Knowing which credentials are out there lets you prioritise which passwords to change.",
                    TaskCategory.AccountSecurity,
                    HelpLink: "https://haveibeenpwned.com"),

                new("enable_email_2fa",
                    "Enable two-factor authentication on your email account",
                    "Set up 2FA using an authenticator app on your email account. This single step stops most phishing-driven account takeovers even when a password is stolen.",
                    "Your email account is the master key — with it an attacker can reset every other service. 2FA means stolen passwords alone are not sufficient to gain access.",
                    TaskCategory.AccountSecurity,
                    GuidanceMarkdown:
                        "1. Open your email provider's **Security settings**\n" +
                        "2. Enable **Two-step verification** or **2FA**\n" +
                        "3. Choose an **authenticator app** (Google Authenticator, Microsoft Authenticator) over SMS\n" +
                        "4. Save your backup codes somewhere safe offline"),

                new("brief_family_phishing",
                    "Brief all family members on this phishing tactic",
                    "Share what happened — the sender, the pretext, and what made it convincing — with every family member so they recognise the same approach if targeted.",
                    "Scammers reuse effective scripts. A briefed household is significantly less likely to fall for the same tactic when it arrives in their inbox or phone.",
                    TaskCategory.ScamReadiness),
            ]
        ),

        // ── Password compromise ──────────────────────────────────────────────
        [IncidentType.PasswordCompromise] = new(

            Immediate:
            [
                new("change_compromised_password",
                    "Change the compromised password immediately",
                    "Change the password for the affected account right now from a trusted, clean device. " +
                    "Do not use a variation of the old password.",
                    "Credential stuffing tools test millions of password combinations per second. " +
                    "Every minute of delay extends the window for automated attacks.",
                    TaskCategory.AccountSecurity,
                    GuidanceMarkdown:
                        "1. Open the account from a **trusted device** (not a shared or public computer)\n" +
                        "2. Go to **Settings → Security → Change password**\n" +
                        "3. Use a password manager to generate a unique, 16+ character password\n" +
                        "4. Do not reuse any previous password"),

                new("sign_out_all_sessions",
                    "Sign out of all active sessions on the affected account",
                    "After changing the password, use 'Sign out everywhere' or 'Sign out of all other sessions' to immediately revoke any sessions the attacker may still hold.",
                    "Changing a password does not automatically terminate existing authenticated sessions on some platforms. Explicit session revocation is required.",
                    TaskCategory.AccountSecurity),
            ],

            Guidance:
            [
                new("avoid_password_variation",
                    "⚠ Avoid: Using a variation of the old password",
                    "Password spraying tools automatically test common variations (adding numbers, capitalising the first letter, appending '!' etc.). A variation provides almost no additional protection.",
                    "Automated credential-stuffing tools are designed to test variations. A truly unique new password is the only safe choice.",
                    TaskCategory.AccountSecurity),

                new("avoid_delaying_action",
                    "⚠ Avoid: Delaying — attackers typically act within minutes",
                    "Once credentials are obtained, automated tools try them across hundreds of services immediately. A delay of even 30 minutes can mean multiple accounts are accessed.",
                    "Speed is your most important asset in a password compromise. Immediate action can limit cascade damage.",
                    TaskCategory.AccountSecurity),

                new("avoid_public_computer_login",
                    "⚠ Avoid: Logging into the affected account from a shared or public computer",
                    "Until you confirm the compromise source, treat public and shared devices as potentially compromised. Make all changes from a device you own and trust.",
                    "The original compromise may have occurred via a keylogger on a shared device. Using another such device immediately re-exposes the new password.",
                    TaskCategory.AccountSecurity),
            ],

            ShortTerm:
            [
                new("change_all_reused_passwords",
                    "Change passwords on every account using the same or similar credential",
                    "Identify every account that shares the compromised password and update each one with a separate, unique password. Start with email and banking.",
                    "Credential-stuffing attacks automatically try stolen passwords across thousands of services. Any account sharing the credential is at immediate risk.",
                    TaskCategory.AccountSecurity),

                new("enable_2fa_compromised_account",
                    "Enable two-factor authentication on the compromised account",
                    "Once the password is reset, enable 2FA on the affected account. This prevents re-entry even if the new password is exposed in a future breach.",
                    "2FA breaks the link between password theft and account access. An attacker with the password alone cannot sign in.",
                    TaskCategory.AccountSecurity),

                new("review_account_activity",
                    "Review the account's recent activity log for any unauthorised actions",
                    "Check the account's sign-in history, recent actions, sent messages, and any settings changes made while the attacker had access.",
                    "Understanding what the attacker did in your account is critical for identifying further damage and reporting obligations.",
                    TaskCategory.AccountSecurity,
                    GuidanceMarkdown:
                        "Look for:\n" +
                        "- Unfamiliar sign-in locations or devices\n" +
                        "- Emails sent from your account without your knowledge\n" +
                        "- Changes to recovery email, phone number, or trusted devices\n" +
                        "- New forwarding rules, connected apps, or authorised third-party access"),
            ],

            LongTerm:
            [
                new("setup_password_manager",
                    "Set up a password manager and replace all reused passwords",
                    "Install a password manager for the whole family and migrate every account to a unique, generated password. This eliminates the risk of cascade compromise.",
                    "Password reuse is the most common cause of account takeover. A password manager makes unique passwords effortless.",
                    TaskCategory.AccountSecurity,
                    HelpLink: "https://www.consumer.ftc.gov/articles/password-managers"),

                new("check_breach_exposure_pw",
                    "Check all family emails for known data breaches",
                    "Visit haveibeenpwned.com to understand the full scope of your family's credential exposure across all known breach datasets.",
                    "Knowing which breach datasets contain your credentials allows you to systematically change the most at-risk passwords first.",
                    TaskCategory.AccountSecurity,
                    HelpLink: "https://haveibeenpwned.com"),

                new("enable_remaining_2fa",
                    "Enable two-factor authentication on all remaining critical accounts",
                    "Work through email, banking, social media, cloud storage, and government services to ensure 2FA is active on every account that supports it.",
                    "A compromised password is only dangerous if it grants full access. 2FA ensures stolen passwords alone cannot unlock critical accounts.",
                    TaskCategory.AccountSecurity),
            ]
        ),

        // ── Device lost or stolen ────────────────────────────────────────────
        [IncidentType.DeviceLostOrStolen] = new(

            Immediate:
            [
                new("locate_device",
                    "Attempt to locate the device using Find My or Find My Device",
                    "Open Find My (Apple) or Find My Device (Android/Google) from another device and attempt to locate it on the map. Enable Lost Mode to lock it remotely.",
                    "Lost Mode displays your contact information on the lock screen and prevents the device from being used. It also continues to track location.",
                    TaskCategory.DeviceHygiene,
                    GuidanceMarkdown:
                        "**Apple**: [icloud.com/find](https://www.icloud.com/find) → select device → Lost Mode\n\n" +
                        "**Android/Google**: [find.google.com](https://find.google.com) → secure device"),

                new("initiate_remote_wipe",
                    "Initiate a remote wipe if recovery is unlikely",
                    "If you believe the device has been stolen or you cannot locate it, trigger a remote wipe immediately to erase all personal data, photos, passwords, and app sessions stored on it.",
                    "A remote wipe eliminates access to all accounts, saved credentials, and personal files — even if the screen lock is bypassed.",
                    TaskCategory.DeviceHygiene,
                    GuidanceMarkdown:
                        "**Apple**: icloud.com/find → select device → Erase This Device\n\n" +
                        "**Android**: find.google.com → Erase Device\n\n" +
                        "⚠ This is irreversible — only proceed when recovery is not expected"),

                new("contact_carrier",
                    "Contact your mobile carrier to suspend or report the SIM",
                    "Call your carrier to report the device as stolen. Ask them to suspend the SIM to prevent unauthorised calls, data usage, and SIM-based account recovery attacks.",
                    "An active SIM in a stolen device enables the attacker to receive any SMS 2FA codes sent to your number — including account recovery codes for email and banking.",
                    TaskCategory.AccountSecurity),
            ],

            Guidance:
            [
                new("avoid_self_recovery_attempt",
                    "⚠ Avoid: Attempting to physically recover a stolen device yourself",
                    "Do not confront a suspected thief. Personal safety is more important than any device. Report to police and use remote tools instead.",
                    "Physical confrontation over a device creates unnecessary personal safety risk. Remote wipe and police reporting are safer and equally effective paths.",
                    TaskCategory.DeviceHygiene),

                new("avoid_assuming_screen_lock_safe",
                    "⚠ Avoid: Assuming screen lock protection is sufficient",
                    "Do not assume that because the device has a PIN or fingerprint lock, no data is accessible. PIN locks can be bypassed via hardware attacks, and many apps cache credentials in ways that survive a lock screen.",
                    "Screen locks are a deterrent, not a guarantee. Remote wipe is the only reliable way to prevent data access from a lost device.",
                    TaskCategory.DeviceHygiene),

                new("avoid_delaying_wipe",
                    "⚠ Avoid: Delaying the decision to wipe — every hour increases risk",
                    "The longer the device remains in unknown hands, the more time an attacker has to extract data or connect it to a computer for file access. Act within minutes, not hours.",
                    "Data extraction tools can copy device contents quickly. Immediate remote wipe eliminates this window entirely.",
                    TaskCategory.DeviceHygiene),
            ],

            ShortTerm:
            [
                new("change_device_account_passwords",
                    "Change passwords on all accounts that were logged in on the lost device",
                    "Assume every account that was actively signed in on the device is at risk. Change passwords for email, banking, payment apps, and any corporate accounts, starting with the most sensitive.",
                    "A device screen lock protects the lock screen, not the data accessible within already-authenticated apps. Changing passwords invalidates stored session tokens.",
                    TaskCategory.AccountSecurity),

                new("contact_bank_device_lost",
                    "Contact your bank if mobile banking apps were installed and logged in",
                    "Call your bank's fraud team to inform them the device is lost and to flag the account for suspicious activity. Ask if any transfers or changes have been made since the device was lost.",
                    "Banking apps often use device-level authentication. A device in unknown hands may be sufficient to authorise transactions depending on the bank's security model.",
                    TaskCategory.AccountSecurity),

                new("file_police_report",
                    "File a police report and obtain a report reference number",
                    "Report the theft to your local police and obtain a reference number. This is required for most insurance claims and carrier IMEI blocking requests.",
                    "Without a police report, insurance claims for stolen devices are usually denied and carriers cannot permanently block the IMEI to prevent resale.",
                    TaskCategory.DeviceHygiene),
            ],

            LongTerm:
            [
                new("review_signin_history",
                    "Review sign-in history across all accounts that were on the device",
                    "Check the recent sign-in history on all accounts accessible from the device for any access from unusual locations or devices after the loss.",
                    "If an attacker accessed accounts before you changed the passwords, reviewing history reveals what was accessed and helps scope further damage.",
                    TaskCategory.AccountSecurity),

                new("enable_2fa_device_accounts",
                    "Enable 2FA on all accounts that were accessible from the device",
                    "Now that you have changed the passwords, enable 2FA on accounts that do not already have it — email, banking, and cloud storage as a minimum.",
                    "Even with a changed password, enabling 2FA ensures that any future device loss or credential theft does not result in account access.",
                    TaskCategory.AccountSecurity),

                new("setup_replacement_securely",
                    "Set up the replacement device securely before restoring data",
                    "Before restoring from backup, enable screen lock, full-disk encryption, biometric authentication, and automatic backups on the replacement device.",
                    "Restoring to a device with the same security gaps recreates the same risk exposure immediately.",
                    TaskCategory.DeviceHygiene,
                    GuidanceMarkdown:
                        "1. Enable screen lock (at minimum 6-digit PIN or biometric)\n" +
                        "2. Enable encryption (on by default on modern iOS/Android)\n" +
                        "3. Enable Find My / Find My Device before signing into accounts\n" +
                        "4. Enable automatic cloud backup before restoring data"),
            ]
        ),

        // ── Unauthorised access ──────────────────────────────────────────────
        [IncidentType.UnauthorisedAccess] = new(

            Immediate:
            [
                new("terminate_all_sessions",
                    "Terminate all active sessions on the affected account",
                    "Use the 'Sign out of all devices' or 'Sign out everywhere' option in account security settings to immediately revoke all active sessions, including the attacker's.",
                    "Session tokens remain valid until explicitly revoked, even after a password change on some platforms. Signing out all devices immediately cuts off any active attacker session.",
                    TaskCategory.AccountSecurity),

                new("change_account_password_unauth",
                    "Change the account password from a secure, trusted device",
                    "After terminating sessions, change the password immediately. Use a device you are confident has not been compromised.",
                    "An attacker with the current password could re-establish a new session instantly after you revoke the existing one. Changing the password closes this window.",
                    TaskCategory.AccountSecurity),

                new("enable_2fa_immediately",
                    "Enable two-factor authentication on the affected account right now",
                    "If 2FA is not active, enable it immediately after changing the password. This ensures that a stolen password alone cannot grant future access.",
                    "Unauthorised access most commonly exploits missing 2FA. Enabling it after the incident closes the primary attack vector.",
                    TaskCategory.AccountSecurity),
            ],

            Guidance:
            [
                new("avoid_assuming_attacker_left",
                    "⚠ Avoid: Assuming the attacker has left after you change the password",
                    "Attackers often establish persistent access methods before their initial access is discovered — forwarding rules, added recovery addresses, or connected OAuth apps that survive a password change.",
                    "A password change revokes the login credential but not necessarily all access pathways. Check for persistence mechanisms before declaring the account secure.",
                    TaskCategory.AccountSecurity),

                new("avoid_keeping_unknown_recovery",
                    "⚠ Avoid: Retaining any recovery options you do not recognise",
                    "Carefully review and remove any recovery email, phone number, or trusted device that was not added by you. These are common persistence mechanisms left by attackers.",
                    "A recovery option controlled by the attacker allows them to reset your new password and regain access at any time.",
                    TaskCategory.AccountSecurity),
            ],

            ShortTerm:
            [
                new("clean_recovery_settings",
                    "Review and remove any unrecognised account recovery settings",
                    "Go to account security settings and verify every recovery email, phone number, trusted device, and passkey. Remove anything you do not recognise.",
                    "Recovery settings are the most common persistence mechanism. An unrecognised recovery option means the attacker can reset your password even after you change it.",
                    TaskCategory.AccountSecurity),

                new("check_email_rules_unauth",
                    "Check email settings for any unexpected forwarding rules or filters",
                    "Review your email account for forwarding rules, filters, or auto-forward settings that were added without your knowledge during the period of unauthorised access.",
                    "Silent forwarding rules allow an attacker to continue reading your emails after you regain account control, enabling ongoing surveillance.",
                    TaskCategory.AccountSecurity),

                new("review_activity_log",
                    "Review the account activity log for actions taken by the attacker",
                    "Check the account's recent activity for emails sent, files accessed, settings changed, contacts exported, or purchases made during the breach window.",
                    "Understanding the attacker's actions is essential for damage assessment and determining whether you have wider reporting obligations.",
                    TaskCategory.AccountSecurity),
            ],

            LongTerm:
            [
                new("enable_2fa_pivot_accounts",
                    "Enable 2FA on all accounts the attacker could pivot to",
                    "Identify every account that shares credentials, recovery options, or OAuth connections with the compromised account. Enable 2FA on each one.",
                    "Attackers use compromised accounts to pivot — resetting passwords on linked accounts, exporting contact lists for future phishing, or accessing connected services.",
                    TaskCategory.AccountSecurity),

                new("audit_connected_apps",
                    "Audit all connected apps and revoke any OAuth access you did not authorise",
                    "Review every third-party app or service that has been granted access to the compromised account. Revoke access for anything you do not need or recognise.",
                    "OAuth app access persists after a password change. An attacker may have authorised a malicious app that continues to have read/write access to your account.",
                    TaskCategory.PrivacySharing,
                    GuidanceMarkdown:
                        "**Google**: [myaccount.google.com/security](https://myaccount.google.com/security) → Third-party apps\n\n" +
                        "**Apple**: [appleid.apple.com](https://appleid.apple.com) → Signing in with Apple\n\n" +
                        "**Microsoft**: [account.microsoft.com](https://account.microsoft.com) → App permissions"),

                new("consider_credit_freeze",
                    "Consider a credit freeze if personal information may have been accessed",
                    "If the attacker accessed personal identifying information, financial details, or government ID numbers, consider placing a credit freeze with major credit bureaus.",
                    "A credit freeze prevents new credit applications being processed in your name — the most effective defence against identity-theft-driven fraud.",
                    TaskCategory.ScamReadiness),
            ]
        ),

        // ── Data breach ──────────────────────────────────────────────────────
        [IncidentType.DataBreach] = new(

            Immediate:
            [
                new("change_breached_password",
                    "Change your password on the breached service immediately",
                    "Change the password for the breached service to a new, unique password generated by a password manager. Do not reuse any previous password.",
                    "Breached credentials are typically shared online within hours of a breach. Acting immediately minimises the window before automated attacks use your credentials.",
                    TaskCategory.AccountSecurity),

                new("enable_breached_2fa",
                    "Enable 2FA on the breached account",
                    "If the breached service supports two-factor authentication, enable it now. This ensures that even if your new password is exposed in a future breach, it cannot be used alone.",
                    "2FA transforms a stolen password from 'game over' to 'not enough'. It is the most effective countermeasure after a credential breach.",
                    TaskCategory.AccountSecurity),
            ],

            Guidance:
            [
                new("avoid_breach_notification_links",
                    "⚠ Avoid: Clicking links in emails claiming to be about this breach",
                    "Breach notifications are a common phishing lure. Navigate directly to the breached service by typing the URL in your browser — do not click any link in an email about the breach.",
                    "Attackers send fake breach notification emails to harvest credentials from people who are trying to respond to the real breach. Going directly to the site is the only safe path.",
                    TaskCategory.ScamReadiness),

                new("avoid_password_reuse_breach",
                    "⚠ Avoid: Reusing the new password on any other service",
                    "If you create a new password and use it in multiple places, the next breach of any of those services immediately re-exposes all of them. Every account must have its own unique password.",
                    "Credential stuffing works because most people reuse passwords. A unique password per service means a breach exposure at one site does not cascade to others.",
                    TaskCategory.AccountSecurity),
            ],

            ShortTerm:
            [
                new("change_shared_credential_accounts",
                    "Change passwords on all accounts using the same or similar credential",
                    "Identify every other account that uses the same password as the breached service (or a close variation) and update each one immediately.",
                    "Breach data is used in automated credential-stuffing attacks across thousands of services within hours. Shared passwords mean all affected accounts are at risk.",
                    TaskCategory.AccountSecurity),

                new("check_breach_exposure_db",
                    "Check all family email addresses on haveibeenpwned.com",
                    "Run every family member's email addresses through haveibeenpwned.com to understand the full scope of credential exposure across all known breach datasets.",
                    "A single breach notification may be the tip of the iceberg. A full breach check reveals every known exposure so you can prioritise systematically.",
                    TaskCategory.AccountSecurity,
                    HelpLink: "https://haveibeenpwned.com"),

                new("contact_bank_breach",
                    "Contact your bank if payment card details or banking credentials were included",
                    "If the breach involved financial details, contact your bank's fraud team. Ask whether any suspicious activity has occurred and whether a new card should be issued.",
                    "Payment card details have direct financial value. Early notification to your bank allows them to flag the account for monitoring and issue a replacement card if necessary.",
                    TaskCategory.AccountSecurity),
            ],

            LongTerm:
            [
                new("monitor_financial_statements",
                    "Monitor bank and credit card statements for unusual transactions for 90 days",
                    "Review your statements weekly for the next 90 days. Set up real-time transaction alerts with your bank to be notified instantly of any activity.",
                    "Fraudulent use of breached financial credentials often occurs days or weeks after the initial breach as the data is sold and reused across the criminal ecosystem.",
                    TaskCategory.ScamReadiness),

                new("setup_breach_monitoring",
                    "Set up ongoing breach monitoring for family email addresses",
                    "Register your family's email addresses on haveibeenpwned.com's notification service to receive immediate alerts if they appear in future breach datasets.",
                    "Early notification of future breaches allows you to change credentials before automated attacks use them. Monitoring is a low-effort, high-value ongoing control.",
                    TaskCategory.AccountSecurity,
                    HelpLink: "https://haveibeenpwned.com/NotifyMe"),

                new("review_similar_credentials",
                    "Review all accounts with credentials similar to those exposed in the breach",
                    "If the breach involved a particular password, audit all accounts that may have used it at any point and replace any that have not already been changed.",
                    "Breached credential sets are bought and resold. Accounts using that password even years ago may be targeted if they have not been individually updated.",
                    TaskCategory.AccountSecurity),
            ]
        ),

        // ── Malware infection ────────────────────────────────────────────────
        [IncidentType.MalwareInfection] = new(

            Immediate:
            [
                new("disconnect_infected_device",
                    "Disconnect the infected device from your home network immediately",
                    "Turn off Wi-Fi on the infected device and unplug any Ethernet cable. This isolates the malware from spreading to other devices on your network.",
                    "A networked malware infection can spread to every other device on your home network, potentially compromising routers, smart devices, and other computers simultaneously.",
                    TaskCategory.DeviceHygiene),

                new("stop_sensitive_use",
                    "Stop using the infected device for banking, email, or sensitive activity",
                    "Do not log into any financial, email, or critical account on the infected device until it has been professionally cleaned or wiped. Use a different, trusted device for all sensitive activity.",
                    "Keyloggers and credential-harvesting malware capture everything you type. Using the infected device for sensitive accounts extends the attacker's data collection window.",
                    TaskCategory.DeviceHygiene),

                new("change_passwords_from_clean_device",
                    "Change all passwords used on the infected device — from a different, clean device",
                    "Assume all passwords entered on the infected device have been captured. Change each one from a separate, trusted device that you are confident has not been compromised.",
                    "Password changes made on the infected device are immediately captured by the malware and provide no protection. Changes must be made from an uncompromised machine.",
                    TaskCategory.AccountSecurity),
            ],

            Guidance:
            [
                new("avoid_paying_ransom",
                    "⚠ Avoid: Paying any ransom demand",
                    "Do not pay ransomware demands. Payment does not guarantee file recovery, funds ongoing criminal operations, and may increase the likelihood of being targeted again.",
                    "Paying ransom marks you as a willing payer and a target for repeat attacks. Many victims who pay do not receive functional decryption keys.",
                    TaskCategory.DeviceHygiene,
                    HelpLink: "https://www.nomoreransom.org"),

                new("avoid_connecting_infected_device",
                    "⚠ Avoid: Connecting the infected device to other devices or external storage",
                    "Do not connect the infected device to USB drives, other computers, or network shares. Malware can spread to external storage and use it as a re-infection vector on clean devices.",
                    "Connected storage becomes an infection carrier. A USB drive used on an infected device can infect every other device it is subsequently plugged into.",
                    TaskCategory.DeviceHygiene),

                new("avoid_logging_in_on_infected",
                    "⚠ Avoid: Logging into any account on the infected device before it is cleaned",
                    "Even if you plan to clean the device, do not log into sensitive accounts on it in the meantime. Every credential you enter is potentially captured.",
                    "Keyloggers operate silently between infection and cleaning. Any credential entered during this period is at risk.",
                    TaskCategory.AccountSecurity),
            ],

            ShortTerm:
            [
                new("run_security_scan",
                    "Run a full offline security scan on the infected device",
                    "Boot from an external rescue disk or use a reputable offline security scanner to scan and remove the malware. Avoid scanning from within the infected OS.",
                    "Malware running inside the infected OS can hide itself from scans performed in that environment. Offline scanning from a clean boot environment detects more threats.",
                    TaskCategory.DeviceHygiene,
                    GuidanceMarkdown:
                        "Free rescue disk options:\n" +
                        "- [Kaspersky Rescue Disk](https://www.kaspersky.com/downloads/free-rescue-disk)\n" +
                        "- [Avira Rescue System](https://www.avira.com/en/free-rescue-system)\n\n" +
                        "For ransomware: check [nomoreransom.org](https://www.nomoreransom.org) for free decryption tools before wiping"),

                new("sign_out_all_accounts_malware",
                    "Sign out of all active sessions on critical accounts from a clean device",
                    "Use a trusted device to sign out all sessions on email, banking, and cloud accounts. This revokes any sessions the malware may have hijacked or reported to the attacker.",
                    "Some malware exfiltrates session cookies, which can be loaded by attackers to gain authenticated access without a password. Revoking all sessions invalidates any stolen tokens.",
                    TaskCategory.AccountSecurity),
            ],

            LongTerm:
            [
                new("factory_reset_if_needed",
                    "If infection cannot be fully removed, factory reset and restore from a clean backup",
                    "If the security scan cannot fully remove the infection, a factory reset is the only guaranteed removal method. Restore from a backup taken before the infection.",
                    "Sophisticated malware — particularly rootkits — survives software removal and standard scans. A full factory reset and clean OS install is the only certain remediation.",
                    TaskCategory.DeviceHygiene,
                    GuidanceMarkdown:
                        "1. Identify a backup taken **before** the infection date\n" +
                        "2. Perform a factory reset (Settings → General → Reset on iOS; Settings → System → Reset on Android)\n" +
                        "3. Reinstall the OS from official sources on computers\n" +
                        "4. Restore from the pre-infection backup only"),

                new("enable_2fa_post_malware",
                    "Enable two-factor authentication on all critical accounts",
                    "With the device cleaned or replaced, enable 2FA on every account that was accessible from the infected device. This protects against any credentials captured during the infection.",
                    "If the malware captured credentials before you changed them, 2FA is the fallback protection that prevents those harvested credentials from being used.",
                    TaskCategory.AccountSecurity),

                new("check_router_settings",
                    "Review home router settings for DNS changes made by the malware",
                    "Log into your router's admin panel and verify the DNS settings have not been changed. Some malware modifies DNS to redirect traffic through attacker-controlled servers.",
                    "Maliciously modified DNS settings redirect your browser even on fully cleaned devices, sending traffic through attacker infrastructure. This is often overlooked in remediation.",
                    TaskCategory.NetworkSecurity,
                    GuidanceMarkdown:
                        "1. Access your router at its IP address (usually 192.168.1.1 or 192.168.0.1)\n" +
                        "2. Look for **DNS settings** in WAN or Internet configuration\n" +
                        "3. Verify DNS servers are from your ISP or a trusted provider (e.g. 8.8.8.8, 1.1.1.1)\n" +
                        "4. If changed, reset to automatic or your ISP's default DNS"),
            ]
        ),

        // ── Scam or fraud ────────────────────────────────────────────────────
        [IncidentType.ScamOrFraud] = new(

            Immediate:
            [
                new("stop_communicating_scammer",
                    "Stop all communication with the scammer immediately",
                    "End all contact — phone calls, messages, email — with the scammer right now. Do not send any more money, information, or documents, regardless of any threats made.",
                    "Continuing to engage gives the scammer opportunities to extract more money or information. Every interaction after the first provides diminishing safety and increasing cost.",
                    TaskCategory.ScamReadiness),

                new("contact_bank_immediately",
                    "Contact your bank immediately if any financial transfer was made",
                    "Call your bank's fraud line now. Banks can sometimes recall wire transfers if reported quickly. Ask them to freeze the account or place a fraud alert.",
                    "Wire transfer recall windows are often 24-48 hours. Every minute of delay reduces the likelihood of fund recovery. Act before the scammer moves the money.",
                    TaskCategory.AccountSecurity),

                new("preserve_scam_evidence",
                    "Screenshot and preserve all evidence — messages, phone numbers, payment receipts",
                    "Before blocking or deleting anything, screenshot every message, record every phone number used, and save all transaction receipts. You will need this to report the scam and support any recovery.",
                    "Evidence is required for any police report, insurance claim, or bank dispute. Scammers clean up communication trails quickly — preserve yours first.",
                    TaskCategory.ScamReadiness),
            ],

            Guidance:
            [
                new("avoid_further_payments",
                    "⚠ Avoid: Sending any further money — no legitimate authority asks for more payments to resolve fraud",
                    "If the scammer contacts you again claiming to need more money to release funds or resolve the situation, this is a continuation of the scam. Stop all payments.",
                    "The 'one more payment' technique is a standard scam tactic designed to extend extraction. There is never a legitimate reason to receive your money back if you send more first.",
                    TaskCategory.ScamReadiness),

                new("avoid_irreversible_transfers",
                    "⚠ Avoid: Gift cards, wire transfers, or cryptocurrency — all are irreversible",
                    "Gift card codes, wire transfers, and crypto payments cannot be reversed once sent. If being pressured to pay this way, it is almost certainly a scam.",
                    "These payment methods are exclusively requested by scammers precisely because they are irreversible. Any legitimate transaction uses reversible payment methods.",
                    TaskCategory.ScamReadiness),

                new("avoid_reengaging_scammer",
                    "⚠ Avoid: Engaging further with the scammer — even to confront them",
                    "Do not attempt to reason with, confront, or threaten the scammer. This is unproductive and may escalate their behaviour or reveal further personal information.",
                    "Confronting scammers rarely leads to anything constructive and may increase harassment. Reporting to authorities is a more effective path.",
                    TaskCategory.ScamReadiness),
            ],

            ShortTerm:
            [
                new("document_scam_details",
                    "Document all scammer contact details and interaction records",
                    "Record all phone numbers, email addresses, usernames, social media accounts, and bank account details the scammer provided. Create a written timeline of all interactions.",
                    "A complete record is required for police reports, bank disputes, and national fraud authority reports. Gaps in documentation weaken any recovery action.",
                    TaskCategory.ScamReadiness),

                new("report_scam_to_authority",
                    "Report the scam to your national consumer protection authority",
                    "File a report with your relevant national authority (ACCC ScamWatch in Australia, Action Fraud in the UK, the FTC in the US). This creates a formal record and contributes to scam pattern tracking.",
                    "Formal reports create a record for law enforcement, contribute to scam trend analysis, and may trigger warnings that protect other people from the same scam.",
                    TaskCategory.ScamReadiness,
                    GuidanceMarkdown:
                        "- **Australia**: [scamwatch.gov.au](https://www.scamwatch.gov.au)\n" +
                        "- **UK**: [actionfraud.police.uk](https://www.actionfraud.police.uk)\n" +
                        "- **US**: [reportfraud.ftc.gov](https://reportfraud.ftc.gov)"),

                new("alert_family_members_scam",
                    "Alert all family members — the same scammer may target them next",
                    "Warn every household member about the scam type, the method used, and the specific contact details to watch for. Scammers frequently target multiple members of the same family.",
                    "Scammers share successful contact lists and sometimes deliberately target families after compromising one member. Prior warning dramatically reduces success rates.",
                    TaskCategory.FamilySafety),
            ],

            LongTerm:
            [
                new("check_credit_report_scam",
                    "Check your credit report for any new accounts opened using your details",
                    "Scammers who obtained personal identifying information may attempt to open credit cards, loans, or phone contracts in your name. Check your credit report across all bureaus.",
                    "Identity fraud following a scam is common — the scammer may have collected enough personal details during the scam to apply for credit in your name.",
                    TaskCategory.ScamReadiness),

                new("change_shared_passwords_scam",
                    "Change passwords on any accounts where details were shared with the scammer",
                    "If you provided account passwords, PINs, or let the scammer access your device remotely, change passwords on all associated accounts immediately.",
                    "Remote access scams in particular compromise every password visible on screen or stored in the browser during the session.",
                    TaskCategory.AccountSecurity),

                new("brief_family_on_scam_type",
                    "Brief all family members on this specific scam type",
                    "Share the full details of the scam — the pretext, how it was presented, and what made it convincing. Specific examples are significantly more effective at building awareness than generic warnings.",
                    "Scam scripts are reused extensively. A family that understands the exact mechanics of the scam that targeted them is far more resistant to its next iteration.",
                    TaskCategory.ScamReadiness),
            ]
        ),

        // ── Identity theft ───────────────────────────────────────────────────
        [IncidentType.IdentityTheft] = new(

            Immediate:
            [
                new("place_fraud_alert_bureaus",
                    "Place a fraud alert with all major credit bureaus immediately",
                    "Contact each major credit bureau to place an initial fraud alert. This requires lenders to take extra verification steps before opening new accounts in your name — it is free and takes effect immediately.",
                    "A fraud alert is the fastest way to prevent further fraudulent credit applications. It can be placed with a single phone call and automatically notifies all bureaus.",
                    TaskCategory.ScamReadiness,
                    GuidanceMarkdown:
                        "- **US**: Equifax (1-800-685-1111), Experian (1-888-397-3742), TransUnion (1-800-888-4213)\n" +
                        "- **Australia**: Equifax (13 83 32), Experian (1300 783 684)\n" +
                        "- **UK**: Experian, Equifax, TransUnion — via Cifas (0330 100 2929)"),

                new("contact_financial_institutions",
                    "Contact your bank and all financial institutions immediately",
                    "Call every financial institution you hold accounts with and inform them that your identity has been stolen. Ask them to flag your accounts for suspicious activity and enhanced verification.",
                    "Early notification allows banks to set up monitoring, challenge any new applications, and flag suspicious transactions before they are processed.",
                    TaskCategory.AccountSecurity),

                new("report_identity_theft_authority",
                    "Report the identity theft to your national authority",
                    "File an official identity theft report with the appropriate national authority. This creates a formal record required for disputing fraudulent accounts and provides legal protections.",
                    "An official report is the legal foundation for all downstream dispute resolution. Without it, organisations are not obligated to remove fraudulent accounts from your name.",
                    TaskCategory.ScamReadiness,
                    GuidanceMarkdown:
                        "- **US**: [IdentityTheft.gov](https://www.identitytheft.gov) — generates a personalised recovery plan\n" +
                        "- **Australia**: ACCC ScamWatch: [scamwatch.gov.au](https://www.scamwatch.gov.au)\n" +
                        "- **UK**: Action Fraud: [actionfraud.police.uk](https://www.actionfraud.police.uk)"),
            ],

            Guidance:
            [
                new("avoid_ignoring_identity_theft",
                    "⚠ Avoid: Ignoring or delaying — identity theft compounds without action",
                    "Unlike financial fraud, identity theft compounds over time. The attacker may open new accounts, file tax returns, or incur debts in your name over months if not addressed.",
                    "Every day of inaction allows the attacker to create more fraudulent accounts under your name, each of which must be individually disputed. Early containment is exponentially cheaper.",
                    TaskCategory.ScamReadiness),

                new("avoid_sharing_more_pii",
                    "⚠ Avoid: Providing additional personal information to anyone offering to help — verify all callers",
                    "Do not give personal details to unsolicited callers claiming to be from banks, government agencies, or fraud recovery services. Verify by calling the organisation's official number directly.",
                    "Secondary scams targeting identity theft victims are common. Fraudsters pose as recovery helpers to extract further personal information or payment.",
                    TaskCategory.ScamReadiness),

                new("avoid_discarding_fraud_records",
                    "⚠ Avoid: Discarding any documentation related to the fraud",
                    "Keep every letter, email, statement, and communication related to the fraud — even from organisations you have already contacted. You will need these records for ongoing disputes.",
                    "Dispute resolution can take months or years. Complete records are required at every stage and for any escalation to regulators or ombudsmen.",
                    TaskCategory.ScamReadiness),
            ],

            ShortTerm:
            [
                new("request_credit_reports",
                    "Request credit reports from all bureaus and review for unfamiliar accounts",
                    "Request your free credit reports and scrutinise every account, inquiry, and address listed. Flag anything you do not recognise for dispute.",
                    "Credit reports reveal the full scope of identity fraud — new credit cards, loans, phone contracts, or addresses opening under your name without your knowledge.",
                    TaskCategory.ScamReadiness),

                new("change_financial_passwords",
                    "Change passwords on all financial and government service accounts",
                    "Update passwords on every financial account, tax authority account, government service, and healthcare portal. Use unique passwords from a password manager.",
                    "Identity thieves use stolen personal information to access existing accounts as well as open new ones. Compromised account passwords must be changed to prevent ongoing access.",
                    TaskCategory.AccountSecurity),

                new("file_formal_report",
                    "File a formal identity theft report with your national authority",
                    "Complete and submit the official identity theft report form. This document provides legal protection and is required to initiate formal dispute processes with creditors.",
                    "A formal report creates an official timeline and record that is legally admissible when disputing fraudulent accounts. It also protects you from liability for fraudulent activities.",
                    TaskCategory.ScamReadiness),
            ],

            LongTerm:
            [
                new("dispute_fraudulent_accounts",
                    "Contact each institution where fraudulent accounts were opened and initiate disputes",
                    "Write to every organisation where a fraudulent account was opened. Include your identity theft report, proof of identity, and a clear statement that you did not open or authorise the account.",
                    "Each fraudulent account must be individually disputed. Without formal disputes, these accounts remain on your credit file and continue to affect your score and borrowing capacity.",
                    TaskCategory.ScamReadiness),

                new("consider_credit_freeze",
                    "Consider placing a credit freeze for stronger protection than a fraud alert",
                    "A credit freeze prevents any new credit applications from being processed in your name until you unfreeze it. Unlike a fraud alert, it provides absolute blocking rather than enhanced verification.",
                    "A credit freeze is the most powerful protection available. The minor inconvenience of unfreezing when you legitimately need credit is far outweighed by the security benefit.",
                    TaskCategory.ScamReadiness),

                new("replace_compromised_id",
                    "Replace any government-issued identification that was involved",
                    "Contact the issuing authority for any government ID (passport, driver's licence, Medicare card, etc.) that was stolen or used in the identity theft and arrange for replacement and invalidation.",
                    "An active government ID in the hands of an identity thief enables the most severe forms of fraud — opening bank accounts, taking out loans, and crossing borders using your identity.",
                    TaskCategory.ScamReadiness),

                new("setup_credit_monitoring",
                    "Set up ongoing credit monitoring for the next 12 months",
                    "Enrol in a credit monitoring service to receive real-time alerts for any new accounts, inquiries, or changes to your credit file. Many banks and credit bureaus offer this for free.",
                    "Identity theft consequences continue to emerge for months or years after the initial incident. Ongoing monitoring provides an early warning system for any new fraudulent activity.",
                    TaskCategory.ScamReadiness),
            ]
        ),

        // ── Social engineering ───────────────────────────────────────────────
        [IncidentType.SocialEngineering] = new(

            Immediate:
            [
                new("stop_all_communication",
                    "Stop all communication with the attacker immediately",
                    "End every form of contact — phone, message, email, in-person — with the person who manipulated you. Do not provide any further information or access.",
                    "Every continued interaction provides the attacker with more information, opportunities to deepen manipulation, and additional access vectors to exploit.",
                    TaskCategory.ScamReadiness),

                new("change_referenced_credentials",
                    "Change all passwords that were referenced or potentially exposed during the attack",
                    "Change passwords on every account that was mentioned, demonstrated, or could have been seen during the social engineering interaction. Start with email and banking.",
                    "Social engineers use observed or obtained credentials immediately. Every account involved in the interaction must be assumed compromised until the password is changed.",
                    TaskCategory.AccountSecurity),

                new("alert_impersonated_organisation",
                    "Alert the organisation whose identity the attacker used",
                    "If the attacker impersonated a company, government agency, or bank, contact that organisation directly (using the official number) to report the impersonation.",
                    "Organisations use impersonation reports to warn customers, update call centre scripts, and share intelligence with law enforcement about active social engineering campaigns.",
                    TaskCategory.ScamReadiness),
            ],

            Guidance:
            [
                new("avoid_embarrassment_paralysis",
                    "⚠ Avoid: Feeling embarrassed — social engineering deceives trained professionals",
                    "Do not let embarrassment delay your response. Social engineers are highly skilled manipulators. Their success reflects their technique, not your competence. Act immediately.",
                    "Shame and embarrassment are the attacker's most useful tools post-attack — they delay reporting and remediation. Prompt action is more important than self-criticism.",
                    TaskCategory.ScamReadiness),

                new("avoid_reengaging_social_eng",
                    "⚠ Avoid: Engaging further with the attacker — they may escalate",
                    "Do not attempt to confront, argue with, or expose the attacker. This can lead to escalation tactics — threats, harassment, or involving others in further manipulation.",
                    "Confrontation rarely leads to constructive outcomes and prolongs engagement with the attacker. Reporting to authorities is the appropriate channel.",
                    TaskCategory.ScamReadiness),

                new("avoid_underestimating_damage",
                    "⚠ Avoid: Assuming the damage was limited to what was directly discussed",
                    "Social engineers extract more information passively than victims realise. Assume any account, system, or information that was visible, mentioned, or accessible during the interaction may now be known to the attacker.",
                    "Many social engineering victims underestimate the scope of information extracted. A conservative assumption of full exposure drives more thorough remediation.",
                    TaskCategory.AccountSecurity),
            ],

            ShortTerm:
            [
                new("document_se_details",
                    "Document all details of the social engineering interaction while fresh",
                    "Write down everything you remember — the channel used, questions asked, what was shown or shared, what the attacker said, and any accounts or systems accessed during the interaction.",
                    "Memory of detailed interactions fades quickly. A comprehensive record is needed for reports to employers, police, or the impersonated organisation.",
                    TaskCategory.ScamReadiness),

                new("brief_household_se",
                    "Brief all household members on the specific tactic used",
                    "Tell every family member exactly what happened — the pretext, how it was presented, and what made it convincing. The same tactic may be used against other household members.",
                    "Social engineers frequently target multiple members of the same household after a successful attack. Specific, concrete briefings are far more effective than generic warnings.",
                    TaskCategory.FamilySafety),

                new("audit_referenced_accounts",
                    "Review all accounts that were accessible or mentioned during the interaction",
                    "Check the activity history, settings, and connected apps on every account that was opened, referenced, or discussed during the social engineering attack.",
                    "Attackers may have made changes — adding recovery options, authorising OAuth apps, or adjusting settings — while they had access or while you were distracted during the call.",
                    TaskCategory.AccountSecurity),
            ],

            LongTerm:
            [
                new("establish_family_code_word",
                    "Establish a family code word for high-urgency requests",
                    "Agree on a shared secret phrase that family members must provide before any urgent request (money transfer, sharing credentials, allowing remote access) is acted upon.",
                    "A known code word immediately exposes impersonation attempts. An attacker claiming to be a family member in an emergency cannot know a privately agreed code phrase.",
                    TaskCategory.FamilySafety),

                new("enable_2fa_social_eng",
                    "Enable two-factor authentication on all critical accounts",
                    "Social engineering often aims to bypass 2FA via manipulation (e.g., convincing you to read out a code). Enable 2FA on all accounts and never share 2FA codes with anyone.",
                    "2FA significantly raises the bar for account access even when passwords are known. Never sharing 2FA codes on request is one of the most important security habits to build.",
                    TaskCategory.AccountSecurity),

                new("family_se_discussion",
                    "Conduct a family discussion on social engineering tactics and red flags",
                    "Run a practical walkthrough with all family members — phone impersonation scripts, urgent payment request tactics, fake tech support patterns, and how to verify caller identity.",
                    "Regular family discussions about real social engineering tactics turn abstract security awareness into practical recognition skills. Specific examples dramatically increase identification rates.",
                    TaskCategory.FamilySafety),
            ]
        ),
    };

    // Fallback template for IncidentType.Other and any unlisted types
    private static readonly IncidentTaskTemplate s_generic = new(

        Immediate:
        [
            new("change_at_risk_passwords",
                "Change passwords on all accounts you believe may be at risk",
                "Identify every account that could be involved in this incident and change the password immediately. Start with email, then banking, then any accounts where personal information was stored.",
                "Acting quickly on password changes limits the window of unauthorised access. Email is the recovery gateway for all other accounts — secure it first.",
                TaskCategory.AccountSecurity),

            new("enable_2fa_critical_accounts",
                "Enable two-factor authentication on your most important accounts",
                "Enable 2FA on email, banking, and cloud storage accounts as a minimum. Use an authenticator app rather than SMS where possible.",
                "2FA is the single most effective additional protection for accounts. A stolen password alone is insufficient to sign in when 2FA is active.",
                TaskCategory.AccountSecurity),
        ],

        Guidance:
        [
            new("avoid_social_media_discussion",
                "⚠ Avoid: Discussing details of this incident on social media",
                "Do not post about this incident on any social platform. Details could inform attackers of what you know, what has been secured, and what remains vulnerable.",
                "Posting about a security incident reveals the timeline and scope of your response, giving any attacker valuable intelligence about which gaps remain.",
                TaskCategory.ScamReadiness),

            new("avoid_reusing_compromised_passwords",
                "⚠ Avoid: Reusing any passwords that may have been compromised",
                "Do not recycle compromised or related passwords on any account. Use a password manager to generate unique, random passwords for every account.",
                "Reused passwords mean a single compromise cascades across every account that shares it. Unique passwords are the only effective defence.",
                TaskCategory.AccountSecurity),
        ],

        ShortTerm:
        [
            new("document_incident_evidence",
                "Document everything about the incident and preserve all evidence",
                "Write down everything you remember about the incident and preserve all relevant screenshots, messages, and records while the details are fresh.",
                "Evidence is required for any police report, insurance claim, or formal complaint. Memories fade and digital evidence can disappear quickly.",
                TaskCategory.ScamReadiness),

            new("review_all_affected_accounts",
                "Review all potentially affected accounts for signs of unauthorised activity",
                "Check sign-in history, recent actions, connected apps, and account settings on every account that may have been involved in or exposed by this incident.",
                "A comprehensive account review ensures you identify the full scope of any access or changes made during the incident. Missed compromised accounts remain a risk vector.",
                TaskCategory.AccountSecurity),
        ],

        LongTerm:
        [
            new("enable_2fa_remaining_accounts",
                "Enable two-factor authentication on all remaining critical accounts",
                "Work systematically through every critical account — email, banking, government services, cloud storage — and enable 2FA on each one that is not yet protected.",
                "A systemic approach to 2FA ensures no high-value account is left with single-factor authentication. This is the most cost-effective long-term protection measure.",
                TaskCategory.AccountSecurity),

            new("complete_recovery_checklist",
                "Complete all follow-up checklist items in your recovery plan",
                "Work through every item in the incident recovery checklist provided as part of this plan. Each item addresses a specific risk identified during your incident review.",
                "The checklist captures every remediation action identified for your specific incident type. Completing it systematically ensures no identified gap is left unaddressed.",
                TaskCategory.AccountSecurity),
        ]
    );

    // ── Public entry point ────────────────────────────────────────────────────

    /// <summary>
    /// Builds the full set of recovery task specs for the fulfillment context.
    /// Specs are ordered by phase: Immediate (do now) → Guidance (avoid) → Short-term (24h) → Long-term (7 days),
    /// then supplemented with account- and device-specific tasks.
    /// </summary>
    public static IReadOnlyList<TaskGenerationSpec> SelectSpecs(
        FulfillmentContext context, Guid bookingId)
    {
        var specs    = new List<TaskGenerationSpec>();
        var incident = context.LinkedIncident;
        var entityId = incident?.Id ?? bookingId;
        var isSevere = incident?.Severity is IncidentSeverity.High or IncidentSeverity.Critical;
        var familyId = context.Booking.FamilyId;
        var sourceId = bookingId.ToString("N");

        var template = incident is not null && s_templates.TryGetValue(incident.Type, out var t)
            ? t
            : s_generic;

        // ── Phase 1: Immediate actions (do now) — sort 1+ ────────────────────
        int sort = 1;
        foreach (var task in template.Immediate)
            specs.Add(BuildSpec(task, entityId, familyId, sourceId,
                priority: TaskPriority.High,
                phase: TaskPhase.Immediate,
                sortOrder: sort++));

        // ── Phase 2: Guidance items (what not to do) — sort 10+ ──────────────
        sort = 10;
        foreach (var task in template.Guidance)
            specs.Add(BuildSpec(task, entityId, familyId, sourceId,
                priority: TaskPriority.Low,
                phase: TaskPhase.Immediate,
                sortOrder: sort++));

        // ── Phase 3: Short-term tasks (next 24h) — sort 20+ ──────────────────
        // Severe incidents promote short-term tasks to High priority.
        sort = 20;
        foreach (var task in template.ShortTerm)
            specs.Add(BuildSpec(task, entityId, familyId, sourceId,
                priority: isSevere ? TaskPriority.High : TaskPriority.Medium,
                phase: TaskPhase.Immediate,
                sortOrder: sort++));

        // ── Phase 4: Long-term tasks (next 7 days) — sort 30+ ────────────────
        sort = 30;
        foreach (var task in template.LongTerm)
            specs.Add(BuildSpec(task, entityId, familyId, sourceId,
                priority: isSevere ? TaskPriority.Medium : TaskPriority.Low,
                phase: TaskPhase.Next7Days,
                sortOrder: sort++));

        // ── Supplementary: account-linked tasks — sort 50+ ───────────────────
        AddAccountTasks(specs, context, incident, familyId, sourceId, isSevere);

        // ── Supplementary: device-linked tasks — sort 70+ ────────────────────
        AddDeviceTasks(specs, context, incident, familyId, sourceId);

        return specs.AsReadOnly();
    }

    // ── Account-linked supplementary tasks ───────────────────────────────────

    private static void AddAccountTasks(
        List<TaskGenerationSpec> specs,
        FulfillmentContext context,
        Incident? incident,
        Guid familyId,
        string sourceId,
        bool isSevere)
    {
        var accounts = context.Accounts;
        if (accounts.Count == 0) return;

        int sort = 50;

        foreach (var account in accounts.OrderBy(AccountTypePriority))
        {
            // Suspicious activity flag → sign out all sessions for this specific account.
            if (account.SuspiciousActivityFlag)
                specs.Add(new TaskGenerationSpec
                {
                    GenerationKey    = GenerationKeyStrategy.AccountSignOutAllSessions(account.Id),
                    SourceType       = TaskSourceType.IncidentRecoveryPack,
                    SourceId         = sourceId,
                    FamilyId         = familyId,
                    TargetType       = TaskTargetType.Account,
                    TargetId         = account.Id,
                    TargetLabel      = account.MaskedIdentifier,
                    Title            = $"Sign out all active sessions — {account.MaskedIdentifier}",
                    Description      = "Suspicious activity has been flagged on this account. " +
                                       "Sign out of all active sessions immediately to cut off any ongoing unauthorised access, then change the password.",
                    WhyThisMatters   = "Revoking active sessions is the fastest way to stop an attacker who is currently logged in. " +
                                       "Do this before — or simultaneously with — changing the password.",
                    GuidanceMarkdown = "1. Go to **Settings → Security → Active sessions** (or 'Where you're signed in')\n" +
                                       "2. Select **Sign out of all other sessions**\n" +
                                       "3. Change the password immediately after\n" +
                                       "4. Enable 2FA if not already active",
                    Category         = TaskCategory.AccountSecurity,
                    Priority         = TaskPriority.High,
                    Phase            = TaskPhase.Immediate,
                    SortOrder        = sort++,
                });

            // Accounts without 2FA on breach-related incident types.
            if (account.TwoFactorStatus != TwoFactorStatus.Enabled
                && incident?.Type is IncidentType.PhishingAttempt
                                  or IncidentType.PasswordCompromise
                                  or IncidentType.UnauthorisedAccess
                                  or IncidentType.DataBreach
                                  or IncidentType.MalwareInfection)
            {
                var isCritical = account.AccountType is AccountType.Email or AccountType.Banking;
                specs.Add(new TaskGenerationSpec
                {
                    GenerationKey    = GenerationKeyStrategy.AccountEnable2Fa(account.Id),
                    SourceType       = TaskSourceType.IncidentRecoveryPack,
                    SourceId         = sourceId,
                    FamilyId         = familyId,
                    TargetType       = TaskTargetType.Account,
                    TargetId         = account.Id,
                    TargetLabel      = account.MaskedIdentifier,
                    Title            = $"Enable two-factor authentication — {account.MaskedIdentifier}",
                    Description      = "This account has no second sign-in factor. Given the incident type, " +
                                       "enable 2FA as a priority alongside changing the password.",
                    WhyThisMatters   = account.AccountType == AccountType.Email
                        ? "Your email is the recovery gateway for every other account. 2FA on email is your single most impactful security action."
                        : "2FA prevents account access even when passwords are stolen, leaked, or guessed.",
                    GuidanceMarkdown = "1. Go to **Settings → Security → Two-factor authentication**\n" +
                                       "2. Choose an **authenticator app** (Google Authenticator, Microsoft Authenticator) over SMS\n" +
                                       "3. Save your **backup codes** offline",
                    Category         = TaskCategory.AccountSecurity,
                    Priority         = isCritical || isSevere ? TaskPriority.High : TaskPriority.Medium,
                    Phase            = isCritical ? TaskPhase.Immediate : TaskPhase.Next7Days,
                    SortOrder        = sort++,
                });
            }
        }
    }

    // ── Device-linked supplementary tasks ────────────────────────────────────

    private static void AddDeviceTasks(
        List<TaskGenerationSpec> specs,
        FulfillmentContext context,
        Incident? incident,
        Guid familyId,
        string sourceId)
    {
        var devices = context.Devices;
        if (devices.Count == 0) return;

        int sort = 70;

#pragma warning disable CS0618 // DeviceLabel uses obsolete Brand/Model fields intentionally
        foreach (var device in devices)
        {
            // DeviceLostOrStolen → remote wipe task per device.
            if (incident?.Type == IncidentType.DeviceLostOrStolen)
                specs.Add(new TaskGenerationSpec
                {
                    GenerationKey    = GenerationKeyStrategy.Custom("incident", "remote_wipe_device", device.Id.ToString("N")),
                    SourceType       = TaskSourceType.IncidentRecoveryPack,
                    SourceId         = sourceId,
                    FamilyId         = familyId,
                    TargetType       = TaskTargetType.Device,
                    TargetId         = device.Id,
                    TargetLabel      = DeviceLabel(device),
                    Title            = $"Remotely wipe {DeviceLabel(device)}",
                    Description      = "Trigger a remote wipe on this device through Find My (Apple) or Find My Device (Android/Google) " +
                                       "to erase all personal data, accounts, and stored credentials before they can be accessed.",
                    WhyThisMatters   = "Remote wipe is the only reliable protection against data access from a stolen device. " +
                                       "Screen locks and encryption provide partial protection, but wiping eliminates all risk.",
                    GuidanceMarkdown = "**Apple**: [icloud.com/find](https://www.icloud.com/find) → select device → **Erase This Device**\n\n" +
                                       "**Android**: [find.google.com](https://find.google.com) → **Erase Device**\n\n" +
                                       "⚠ This action is irreversible — proceed only once you are not expecting to recover the device",
                    Category         = TaskCategory.DeviceHygiene,
                    Priority         = TaskPriority.High,
                    Phase            = TaskPhase.Immediate,
                    SortOrder        = sort++,
                });

            // MalwareInfection → network isolation task per device.
            if (incident?.Type == IncidentType.MalwareInfection)
                specs.Add(new TaskGenerationSpec
                {
                    GenerationKey    = GenerationKeyStrategy.Custom("incident", "isolate_device", device.Id.ToString("N")),
                    SourceType       = TaskSourceType.IncidentRecoveryPack,
                    SourceId         = sourceId,
                    FamilyId         = familyId,
                    TargetType       = TaskTargetType.Device,
                    TargetId         = device.Id,
                    TargetLabel      = DeviceLabel(device),
                    Title            = $"Isolate {DeviceLabel(device)} from your home network",
                    Description      = "Turn off Wi-Fi and unplug any Ethernet cable on this device to prevent the malware from " +
                                       "spreading to other devices on your network or communicating with attacker-controlled servers.",
                    WhyThisMatters   = "Malware that can communicate with its command-and-control server can receive instructions, " +
                                       "exfiltrate data, and spread to other network devices in real time. Isolation stops all of this.",
                    GuidanceMarkdown = "1. Turn off **Wi-Fi** in device settings or the quick-access panel\n" +
                                       "2. Unplug any **Ethernet cable** if connected\n" +
                                       "3. Turn off **Bluetooth** as a precaution\n" +
                                       "4. Do not reconnect until the device has been professionally cleaned or wiped",
                    Category         = TaskCategory.DeviceHygiene,
                    Priority         = TaskPriority.High,
                    Phase            = TaskPhase.Immediate,
                    SortOrder        = sort++,
                });
        }
#pragma warning restore CS0618
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static TaskGenerationSpec BuildSpec(
        PhaseTask task,
        Guid entityId,
        Guid familyId,
        string sourceId,
        TaskPriority priority,
        TaskPhase phase,
        int sortOrder)
        => new()
        {
            GenerationKey    = GenerationKeyStrategy.Custom("incident", task.KeySuffix, entityId.ToString("N")),
            SourceType       = TaskSourceType.IncidentRecoveryPack,
            SourceId         = sourceId,
            FamilyId         = familyId,
            TargetType       = TaskTargetType.Family,
            Title            = task.Title,
            Description      = task.Description,
            WhyThisMatters   = task.WhyThisMatters,
            GuidanceMarkdown = task.GuidanceMarkdown,
            HelpLink         = task.HelpLink,
            Category         = task.Category,
            Priority         = priority,
            Phase            = phase,
            SortOrder        = sortOrder,
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
