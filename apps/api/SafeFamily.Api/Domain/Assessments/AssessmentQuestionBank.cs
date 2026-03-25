namespace SafeFamily.Api.Domain.Assessments;

/// <summary>
/// Static seed of all assessment questions.  Each question contributes a score
/// of 0–100 to its category; option scores reflect real-world security value.
/// </summary>
public static class AssessmentQuestionBank
{
    public static IReadOnlyList<AssessmentQuestion> All { get; } = Build();

    private static IReadOnlyList<AssessmentQuestion> Build()
    {
        return
        [
            // ── Account Security (5 questions) ────────────────────────────────
            new AssessmentQuestion
            {
                Id = "acc_mfa",
                Category = AssessmentCategory.AccountSecurity,
                Text = "How many of your critical online accounts (email, banking, social) use two-factor authentication (2FA)?",
                Options =
                [
                    new QuestionOption { Value = "none",    Label = "None",                   Score = 0 },
                    new QuestionOption { Value = "some",    Label = "Some of them",            Score = 40 },
                    new QuestionOption { Value = "most",    Label = "Most of them",            Score = 70 },
                    new QuestionOption { Value = "all",     Label = "All of them",             Score = 100 },
                ],
            },
            new AssessmentQuestion
            {
                Id = "acc_passwords",
                Category = AssessmentCategory.AccountSecurity,
                Text = "How do you manage your passwords?",
                Options =
                [
                    new QuestionOption { Value = "reuse",       Label = "I reuse the same password",                      Score = 0 },
                    new QuestionOption { Value = "remembered",  Label = "I remember different passwords",                  Score = 30 },
                    new QuestionOption { Value = "written",     Label = "I write them down",                               Score = 20 },
                    new QuestionOption { Value = "manager",     Label = "I use a password manager",                        Score = 100 },
                ],
            },
            new AssessmentQuestion
            {
                Id = "acc_recovery",
                Category = AssessmentCategory.AccountSecurity,
                Text = "Do you have recovery options (backup email/phone) set up for your important accounts?",
                Options =
                [
                    new QuestionOption { Value = "no",      Label = "No",                      Score = 0 },
                    new QuestionOption { Value = "some",    Label = "For some accounts",        Score = 50 },
                    new QuestionOption { Value = "most",    Label = "For most accounts",        Score = 80 },
                    new QuestionOption { Value = "all",     Label = "Yes, for all accounts",   Score = 100 },
                ],
            },
            new AssessmentQuestion
            {
                Id = "acc_suspicious",
                Category = AssessmentCategory.AccountSecurity,
                Text = "Have you noticed any suspicious activity on your accounts in the last 6 months?",
                Options =
                [
                    new QuestionOption { Value = "yes_unresolved", Label = "Yes, and I haven't addressed it", Score = 0 },
                    new QuestionOption { Value = "yes_resolved",   Label = "Yes, but I resolved it",          Score = 60 },
                    new QuestionOption { Value = "unsure",         Label = "I'm not sure",                    Score = 30 },
                    new QuestionOption { Value = "no",             Label = "No",                              Score = 100 },
                ],
            },
            new AssessmentQuestion
            {
                Id = "acc_review",
                Category = AssessmentCategory.AccountSecurity,
                Text = "How often do you review which apps/services have access to your accounts?",
                Options =
                [
                    new QuestionOption { Value = "never",    Label = "Never",                   Score = 0 },
                    new QuestionOption { Value = "rarely",   Label = "Rarely",                  Score = 25 },
                    new QuestionOption { Value = "yearly",   Label = "Once a year",             Score = 60 },
                    new QuestionOption { Value = "regularly",Label = "Regularly (quarterly+)",  Score = 100 },
                ],
            },

            // ── Device Hygiene (5 questions) ──────────────────────────────────
            new AssessmentQuestion
            {
                Id = "dev_updates",
                Category = AssessmentCategory.DeviceHygiene,
                Text = "How quickly do you apply operating system and security updates on your devices?",
                Options =
                [
                    new QuestionOption { Value = "never",   Label = "I rarely/never update",   Score = 0 },
                    new QuestionOption { Value = "delayed",  Label = "I update when reminded",  Score = 40 },
                    new QuestionOption { Value = "monthly",  Label = "Within a month",          Score = 70 },
                    new QuestionOption { Value = "immediate",Label = "As soon as available",    Score = 100 },
                ],
            },
            new AssessmentQuestion
            {
                Id = "dev_screenlock",
                Category = AssessmentCategory.DeviceHygiene,
                Text = "Do your devices use screen lock (PIN, password, or biometric)?",
                Options =
                [
                    new QuestionOption { Value = "none",     Label = "No, none of them",       Score = 0 },
                    new QuestionOption { Value = "some",     Label = "Some devices",            Score = 50 },
                    new QuestionOption { Value = "all",      Label = "All devices",             Score = 100 },
                ],
            },
            new AssessmentQuestion
            {
                Id = "dev_findmy",
                Category = AssessmentCategory.DeviceHygiene,
                Text = "Do you have 'Find My Device' or similar remote-wipe features enabled?",
                Options =
                [
                    new QuestionOption { Value = "no",       Label = "No",                     Score = 0 },
                    new QuestionOption { Value = "some",     Label = "On some devices",         Score = 50 },
                    new QuestionOption { Value = "yes",      Label = "Yes, on all devices",    Score = 100 },
                ],
            },
            new AssessmentQuestion
            {
                Id = "dev_eol",
                Category = AssessmentCategory.DeviceHygiene,
                Text = "Are any of your devices end-of-life (no longer receiving security updates)?",
                Options =
                [
                    new QuestionOption { Value = "multiple", Label = "Yes, several devices",   Score = 0 },
                    new QuestionOption { Value = "one",      Label = "Yes, one device",        Score = 30 },
                    new QuestionOption { Value = "unsure",   Label = "I'm not sure",           Score = 40 },
                    new QuestionOption { Value = "no",       Label = "No",                     Score = 100 },
                ],
            },
            new AssessmentQuestion
            {
                Id = "dev_antivirus",
                Category = AssessmentCategory.DeviceHygiene,
                Text = "Do you use antivirus or endpoint security software on your computers?",
                Options =
                [
                    new QuestionOption { Value = "no",      Label = "No",                      Score = 0 },
                    new QuestionOption { Value = "some",    Label = "On some computers",       Score = 50 },
                    new QuestionOption { Value = "builtin", Label = "Built-in only (Windows Defender)", Score = 70 },
                    new QuestionOption { Value = "full",    Label = "Yes, dedicated software", Score = 100 },
                ],
            },

            // ── Backup & Recovery (4 questions) ───────────────────────────────
            new AssessmentQuestion
            {
                Id = "bkp_frequency",
                Category = AssessmentCategory.BackupRecovery,
                Text = "How often do you back up your important files?",
                Options =
                [
                    new QuestionOption { Value = "never",    Label = "Never",                  Score = 0 },
                    new QuestionOption { Value = "yearly",   Label = "Once a year or less",    Score = 20 },
                    new QuestionOption { Value = "monthly",  Label = "Monthly",                Score = 60 },
                    new QuestionOption { Value = "weekly",   Label = "Weekly or more often",   Score = 100 },
                ],
            },
            new AssessmentQuestion
            {
                Id = "bkp_offsite",
                Category = AssessmentCategory.BackupRecovery,
                Text = "Where do you store your backups?",
                Options =
                [
                    new QuestionOption { Value = "nowhere",  Label = "I don't back up",        Score = 0 },
                    new QuestionOption { Value = "local",    Label = "Local only (same device)", Score = 20 },
                    new QuestionOption { Value = "cloud",    Label = "Cloud only",              Score = 70 },
                    new QuestionOption { Value = "both",     Label = "Both local and cloud (3-2-1 rule)", Score = 100 },
                ],
            },
            new AssessmentQuestion
            {
                Id = "bkp_tested",
                Category = AssessmentCategory.BackupRecovery,
                Text = "Have you ever tested restoring from a backup?",
                Options =
                [
                    new QuestionOption { Value = "never",    Label = "Never",                  Score = 0 },
                    new QuestionOption { Value = "long_ago", Label = "A long time ago",        Score = 40 },
                    new QuestionOption { Value = "recent",   Label = "Within the past year",   Score = 100 },
                ],
            },
            new AssessmentQuestion
            {
                Id = "bkp_cloud",
                Category = AssessmentCategory.BackupRecovery,
                Text = "Do your mobile devices automatically back up to the cloud?",
                Options =
                [
                    new QuestionOption { Value = "no",       Label = "No",                     Score = 0 },
                    new QuestionOption { Value = "some",     Label = "Some devices",            Score = 50 },
                    new QuestionOption { Value = "yes",      Label = "Yes, all devices",       Score = 100 },
                ],
            },

            // ── Privacy & Sharing (4 questions) ───────────────────────────────
            new AssessmentQuestion
            {
                Id = "prv_social",
                Category = AssessmentCategory.PrivacySharing,
                Text = "How do you configure privacy settings on your social media profiles?",
                Options =
                [
                    new QuestionOption { Value = "public",   Label = "Mostly public",          Score = 0 },
                    new QuestionOption { Value = "default",  Label = "Default settings",       Score = 30 },
                    new QuestionOption { Value = "friends",  Label = "Friends/family only",    Score = 80 },
                    new QuestionOption { Value = "reviewed", Label = "Regularly reviewed",     Score = 100 },
                ],
            },
            new AssessmentQuestion
            {
                Id = "prv_location",
                Category = AssessmentCategory.PrivacySharing,
                Text = "How carefully do you manage location sharing on your devices and apps?",
                Options =
                [
                    new QuestionOption { Value = "always_on", Label = "Always on for many apps", Score = 0 },
                    new QuestionOption { Value = "unchecked", Label = "Rarely think about it",   Score = 25 },
                    new QuestionOption { Value = "selective", Label = "Selective (only essential)", Score = 80 },
                    new QuestionOption { Value = "minimal",   Label = "Minimal, regularly audited", Score = 100 },
                ],
            },
            new AssessmentQuestion
            {
                Id = "prv_data_sharing",
                Category = AssessmentCategory.PrivacySharing,
                Text = "Do you read privacy policies or check what data apps collect before installing?",
                Options =
                [
                    new QuestionOption { Value = "never",    Label = "Never",                  Score = 0 },
                    new QuestionOption { Value = "rarely",   Label = "Rarely",                 Score = 25 },
                    new QuestionOption { Value = "sometimes",Label = "Sometimes for sensitive apps", Score = 70 },
                    new QuestionOption { Value = "always",   Label = "Always",                 Score = 100 },
                ],
            },
            new AssessmentQuestion
            {
                Id = "prv_wifi",
                Category = AssessmentCategory.PrivacySharing,
                Text = "Do you use a VPN or take precautions when using public Wi-Fi?",
                Options =
                [
                    new QuestionOption { Value = "no_caution",  Label = "No, I use public Wi-Fi freely", Score = 0 },
                    new QuestionOption { Value = "avoid",        Label = "I try to avoid public Wi-Fi",   Score = 60 },
                    new QuestionOption { Value = "vpn",          Label = "Yes, I use a VPN",              Score = 100 },
                ],
            },

            // ── Scam Readiness (4 questions) ──────────────────────────────────
            new AssessmentQuestion
            {
                Id = "scm_phishing",
                Category = AssessmentCategory.ScamReadiness,
                Text = "How confident are you at identifying phishing emails or fake websites?",
                Options =
                [
                    new QuestionOption { Value = "not_confident", Label = "Not confident at all",    Score = 0 },
                    new QuestionOption { Value = "somewhat",      Label = "Somewhat confident",       Score = 50 },
                    new QuestionOption { Value = "confident",     Label = "Confident",                Score = 80 },
                    new QuestionOption { Value = "very",          Label = "Very confident — I verify before clicking", Score = 100 },
                ],
            },
            new AssessmentQuestion
            {
                Id = "scm_unsolicited",
                Category = AssessmentCategory.ScamReadiness,
                Text = "If you receive an unexpected call or message asking you to act urgently (payment, account issue), what do you do?",
                Options =
                [
                    new QuestionOption { Value = "comply",       Label = "I usually comply if it seems official", Score = 0 },
                    new QuestionOption { Value = "unsure",       Label = "I'm unsure how to respond",             Score = 20 },
                    new QuestionOption { Value = "cautious",     Label = "I'm cautious but sometimes act",        Score = 60 },
                    new QuestionOption { Value = "verify_first", Label = "I always verify independently first",   Score = 100 },
                ],
            },
            new AssessmentQuestion
            {
                Id = "scm_family",
                Category = AssessmentCategory.ScamReadiness,
                Text = "Have you talked to your family members (especially children/elderly) about online scams?",
                Options =
                [
                    new QuestionOption { Value = "never",    Label = "Never",                 Score = 0 },
                    new QuestionOption { Value = "once",     Label = "Once or twice",         Score = 40 },
                    new QuestionOption { Value = "regularly",Label = "Regularly",             Score = 100 },
                ],
            },
            new AssessmentQuestion
            {
                Id = "scm_incident",
                Category = AssessmentCategory.ScamReadiness,
                Text = "Does your family have a plan for what to do if someone is scammed or hacked?",
                Options =
                [
                    new QuestionOption { Value = "no",       Label = "No",                    Score = 0 },
                    new QuestionOption { Value = "informal", Label = "Informally yes",        Score = 60 },
                    new QuestionOption { Value = "yes",      Label = "Yes, a clear plan",     Score = 100 },
                ],
            },
        ];
    }
}
