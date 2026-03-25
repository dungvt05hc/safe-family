using System.ComponentModel.DataAnnotations;
using SafeFamily.Api.Domain.Accounts;

namespace SafeFamily.Api.Features.Accounts.Dtos;

public class CreateAccountRequest
{
    /// <summary>Optional — links this account to a specific family member (FamilyPerson).</summary>
    public Guid? MemberId { get; set; }

    [Required]
    public AccountType AccountType { get; set; }

    /// <summary>
    /// Display-only masked identifier, e.g. "****@gmail.com" or "Chase ****4321".
    /// Do NOT include passwords, OTPs, or any secret credentials here.
    /// </summary>
    [Required]
    [MaxLength(255)]
    public string MaskedIdentifier { get; set; } = string.Empty;

    public TwoFactorStatus TwoFactorStatus { get; set; }
    public RecoveryStatus RecoveryEmailStatus { get; set; }
    public RecoveryStatus RecoveryPhoneStatus { get; set; }
    public bool SuspiciousActivityFlag { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}
