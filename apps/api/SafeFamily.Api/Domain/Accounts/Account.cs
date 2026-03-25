using SafeFamily.Api.Domain.Common;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Domain.Accounts;

/// <summary>
/// Represents an online account (e.g. email, bank, social media) tracked for a family member.
/// No passwords, OTPs, or secrets are stored — only status and metadata.
/// </summary>
public class Account : AuditableEntity
{
    public Guid FamilyId { get; set; }

    /// <summary>Optional link to a specific <see cref="FamilyPerson"/> within the family.</summary>
    public Guid? MemberId { get; set; }

    public AccountType AccountType { get; set; }

    /// <summary>
    /// A display-only masked identifier (e.g. "****@gmail.com", "Chase ****4321").
    /// Never store the actual credential.
    /// </summary>
    public string MaskedIdentifier { get; set; } = string.Empty;

    public TwoFactorStatus TwoFactorStatus { get; set; }
    public RecoveryStatus RecoveryEmailStatus { get; set; }
    public RecoveryStatus RecoveryPhoneStatus { get; set; }
    public bool SuspiciousActivityFlag { get; set; }
    public string? Notes { get; set; }

    // ── Navigation ─────────────────────────────────────────────────────────────
    public Family Family { get; set; } = null!;
    public FamilyPerson? Member { get; set; }
}
