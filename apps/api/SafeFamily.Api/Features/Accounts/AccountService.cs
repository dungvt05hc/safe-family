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

    public async Task<IReadOnlyList<AccountResponse>> GetAccountsAsync(Guid userId, AccountQuery query, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var q = _db.Accounts
            .Where(a => a.FamilyId == familyId && a.ArchivedAt == null);

        if (query.MemberId.HasValue)
            q = q.Where(a => a.MemberId == query.MemberId.Value);

        if (query.AccountType.HasValue)
            q = q.Where(a => a.AccountType == query.AccountType.Value);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(a =>
                a.MaskedIdentifier.ToLower().Contains(term) ||
                (a.Notes != null && a.Notes.ToLower().Contains(term)));
        }

        return await q
            .OrderBy(a => a.AccountType)
            .ThenBy(a => a.MaskedIdentifier)
            .Select(a => ToResponse(a))
            .ToListAsync(ct);
    }

    public async Task<AccountResponse?> GetAccountByIdAsync(Guid userId, Guid id, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var account = await _db.Accounts
            .FirstOrDefaultAsync(a => a.Id == id && a.FamilyId == familyId && a.ArchivedAt == null, ct);

        return account is null ? null : ToResponse(account);
    }

    public async Task<AccountResponse> CreateAccountAsync(Guid userId, CreateAccountRequest request, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

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
            .FirstOrDefaultAsync(a => a.Id == id && a.FamilyId == familyId && a.ArchivedAt == null, ct);

        if (account is null)
            return null;

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

    public async Task<bool> ArchiveAccountAsync(Guid userId, Guid id, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var account = await _db.Accounts
            .FirstOrDefaultAsync(a => a.Id == id && a.FamilyId == familyId && a.ArchivedAt == null, ct);

        if (account is null)
            return false;

        account.ArchivedAt = DateTimeOffset.UtcNow;
        account.UpdatedById = userId;

        await _db.SaveChangesAsync(ct);

        return true;
    }

    public async Task<AccountSummaryResponse> GetSummaryAsync(Guid userId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var accounts = await _db.Accounts
            .Where(a => a.FamilyId == familyId && a.ArchivedAt == null)
            .Select(a => new
            {
                a.TwoFactorStatus,
                a.RecoveryEmailStatus,
                a.RecoveryPhoneStatus,
                a.SuspiciousActivityFlag,
            })
            .ToListAsync(ct);

        return new AccountSummaryResponse(
            Total: accounts.Count,
            Without2Fa: accounts.Count(a => a.TwoFactorStatus != TwoFactorStatus.Enabled),
            MissingRecoveryEmail: accounts.Count(a => a.RecoveryEmailStatus == RecoveryStatus.NotSet),
            MissingRecoveryPhone: accounts.Count(a => a.RecoveryPhoneStatus == RecoveryStatus.NotSet),
            Suspicious: accounts.Count(a => a.SuspiciousActivityFlag));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

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
