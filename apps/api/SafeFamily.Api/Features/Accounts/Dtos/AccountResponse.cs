using SafeFamily.Api.Domain.Accounts;

namespace SafeFamily.Api.Features.Accounts.Dtos;

public record AccountResponse(
    Guid Id,
    Guid FamilyId,
    Guid? MemberId,
    AccountType AccountType,
    string MaskedIdentifier,
    TwoFactorStatus TwoFactorStatus,
    RecoveryStatus RecoveryEmailStatus,
    RecoveryStatus RecoveryPhoneStatus,
    bool SuspiciousActivityFlag,
    string? Notes,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
