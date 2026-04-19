namespace SafeFamily.Api.Domain.Tasks;

/// <summary>
/// Groups safety tasks into digital safety topic areas.
/// Mirrors the assessment scoring categories so risk scores and tasks align.
/// Stored as a string for readability and migration safety.
/// </summary>
public enum TaskCategory
{
    /// <summary>Passwords, 2FA, account recovery, credential hygiene.</summary>
    AccountSecurity  = 1,

    /// <summary>OS updates, screen lock, encryption, malware protection.</summary>
    DeviceHygiene    = 2,

    /// <summary>App permissions, social media privacy, data exposure.</summary>
    PrivacySharing   = 3,

    /// <summary>Cloud backups, recovery plans, data redundancy.</summary>
    BackupRecovery   = 4,

    /// <summary>Phishing awareness, scam recognition, social engineering.</summary>
    ScamReadiness    = 5,

    /// <summary>Network security, router hardening, VPN usage.</summary>
    NetworkSecurity  = 6,

    /// <summary>Parental controls, child online safety, screen time.</summary>
    FamilySafety     = 7,
}
