namespace SafeFamily.Api.Features.Accounts.Dtos;

/// <summary>
/// Lightweight account counts returned by GET /api/accounts/summary.
/// Useful for dashboard widgets and future assessment scoring.
/// </summary>
public record AccountSummaryResponse(
    int Total,
    int Without2Fa,
    int MissingRecoveryEmail,
    int MissingRecoveryPhone,
    int Suspicious);
