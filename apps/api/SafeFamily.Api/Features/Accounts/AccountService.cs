using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Accounts;
using SafeFamily.Api.Features.Accounts.Dtos;

namespace SafeFamily.Api.Features.Accounts;

public class AccountService : IAccountService
{
    private readonly AppDbContext _db;

    public AccountService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<AccountResponse>> GetAccountsAsync(Guid userId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        return await _db.Accounts
            .Where(a => a.FamilyId == familyId)
            .OrderBy(a => a.AccountType)
            .ThenBy(a => a.MaskedIdentifier)
            .Select(a => ToResponse(a))
            .ToListAsync(ct);
    }

    public async Task<AccountResponse?> GetAccountByIdAsync(Guid userId, Guid id, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var account = await _db.Accounts
            .FirstOrDefaultAsync(a => a.Id == id && a.FamilyId == familyId, ct);

        return account is null ? null : ToResponse(account);
    }

    public async Task<AccountResponse> CreateAccountAsync(Guid userId, CreateAccountRequest request, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        // When a memberId is supplied, verify it belongs to this family.
        if (request.MemberId.HasValue)
            await RequireMemberInFamilyAsync(request.MemberId.Value, familyId, ct);

        var account = new Account
        {
            FamilyId = familyId,
            MemberId = request.MemberId,
            AccountType = request.AccountType,
            MaskedIdentifier = request.MaskedIdentifier.Trim(),
            TwoFactorStatus = request.TwoFactorStatus,
            RecoveryEmailStatus = request.RecoveryEmailStatus,
            RecoveryPhoneStatus = request.RecoveryPhoneStatus,
            SuspiciousActivityFlag = request.SuspiciousActivityFlag,
            Notes = request.Notes?.Trim(),
            CreatedById = userId,
            UpdatedById = userId,
        };

        _db.Accounts.Add(account);
        await _db.SaveChangesAsync(ct);

        return ToResponse(account);
    }

    public async Task<AccountResponse?> UpdateAccountAsync(Guid userId, Guid id, UpdateAccountRequest request, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var account = await _db.Accounts
            .FirstOrDefaultAsync(a => a.Id == id && a.FamilyId == familyId, ct);

        if (account is null)
            return null;

        // When a memberId is supplied, verify it belongs to this family.
        if (request.MemberId.HasValue)
            await RequireMemberInFamilyAsync(request.MemberId.Value, familyId, ct);

        account.MemberId = request.MemberId;
        account.AccountType = request.AccountType;
        account.MaskedIdentifier = request.MaskedIdentifier.Trim();
        account.TwoFactorStatus = request.TwoFactorStatus;
        account.RecoveryEmailStatus = request.RecoveryEmailStatus;
        account.RecoveryPhoneStatus = request.RecoveryPhoneStatus;
        account.SuspiciousActivityFlag = request.SuspiciousActivityFlag;
        account.Notes = request.Notes?.Trim();
        account.UpdatedById = userId;

        await _db.SaveChangesAsync(ct);

        return ToResponse(account);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Returns the FamilyId for the given user, or throws <see cref="ForbiddenException"/>
    /// when the user has not joined a family yet.
    /// </summary>
    private async Task<Guid> RequireFamilyIdAsync(Guid userId, CancellationToken ct)
    {
        var familyId = await _db.FamilyMembers
            .Where(m => m.UserId == userId)
            .Select(m => (Guid?)m.FamilyId)
            .FirstOrDefaultAsync(ct);

        if (familyId is null)
            throw new ForbiddenException("You must be part of a family to manage accounts.");

        return familyId.Value;
    }

    /// <summary>
    /// Verifies that the given member (FamilyPerson) belongs to the given family,
    /// throwing <see cref="ForbiddenException"/> if not found.
    /// </summary>
    private async Task RequireMemberInFamilyAsync(Guid memberId, Guid familyId, CancellationToken ct)
    {
        var exists = await _db.FamilyPersons
            .AnyAsync(p => p.Id == memberId && p.FamilyId == familyId && p.ArchivedAt == null, ct);

        if (!exists)
            throw new ForbiddenException("The specified member does not belong to your family.");
    }

    private static AccountResponse ToResponse(Account a) =>
        new(a.Id, a.FamilyId, a.MemberId, a.AccountType, a.MaskedIdentifier,
            a.TwoFactorStatus, a.RecoveryEmailStatus, a.RecoveryPhoneStatus,
            a.SuspiciousActivityFlag, a.Notes, a.CreatedAt, a.UpdatedAt);
}
