using SafeFamily.Api.Domain.Accounts;

namespace SafeFamily.Api.Features.Accounts.Dtos;

/// <summary>Represents the optional query filters on GET /api/accounts.</summary>
public class AccountQuery
{
    /// <summary>Filter by a specific family member.</summary>
    public Guid? MemberId { get; set; }

    /// <summary>Filter by account type (e.g. Email, Banking, …).</summary>
    public AccountType? AccountType { get; set; }

    /// <summary>Free-text search against the masked identifier and notes fields.</summary>
    public string? Search { get; set; }
}
