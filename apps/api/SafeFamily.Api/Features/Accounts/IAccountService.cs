using SafeFamily.Api.Features.Accounts.Dtos;

namespace SafeFamily.Api.Features.Accounts;

public interface IAccountService
{
    Task<IReadOnlyList<AccountResponse>> GetAccountsAsync(Guid userId, CancellationToken ct = default);
    Task<AccountResponse?> GetAccountByIdAsync(Guid userId, Guid id, CancellationToken ct = default);
    Task<AccountResponse> CreateAccountAsync(Guid userId, CreateAccountRequest request, CancellationToken ct = default);
    Task<AccountResponse?> UpdateAccountAsync(Guid userId, Guid id, UpdateAccountRequest request, CancellationToken ct = default);
}
