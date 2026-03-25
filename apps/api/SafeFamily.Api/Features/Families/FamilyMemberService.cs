using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Families;
using SafeFamily.Api.Features.Families.Dtos;

namespace SafeFamily.Api.Features.Families;

public class FamilyMemberService : IFamilyMemberService
{
    private readonly AppDbContext _db;

    public FamilyMemberService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<FamilyMemberResponse>> GetMembersAsync(Guid userId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        return await _db.FamilyPersons
            .Where(p => p.FamilyId == familyId && p.ArchivedAt == null)
            .OrderBy(p => p.CreatedAt)
            .Select(p => ToResponse(p))
            .ToListAsync(ct);
    }

    public async Task<FamilyMemberResponse> CreateMemberAsync(Guid userId, CreateFamilyMemberRequest request, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var person = new FamilyPerson
        {
            FamilyId = familyId,
            DisplayName = request.DisplayName.Trim(),
            Relationship = request.Relationship.Trim(),
            AgeGroup = request.AgeGroup,
            PrimaryEcosystem = request.PrimaryEcosystem.Trim(),
            IsPrimaryContact = request.IsPrimaryContact,
            CreatedById = userId,
            UpdatedById = userId,
        };

        _db.FamilyPersons.Add(person);
        await _db.SaveChangesAsync(ct);

        return ToResponse(person);
    }

    public async Task<FamilyMemberResponse?> UpdateMemberAsync(Guid userId, Guid memberId, UpdateFamilyMemberRequest request, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var person = await _db.FamilyPersons
            .FirstOrDefaultAsync(p => p.Id == memberId && p.FamilyId == familyId && p.ArchivedAt == null, ct);

        if (person is null)
            return null;

        person.DisplayName = request.DisplayName.Trim();
        person.Relationship = request.Relationship.Trim();
        person.AgeGroup = request.AgeGroup;
        person.PrimaryEcosystem = request.PrimaryEcosystem.Trim();
        person.IsPrimaryContact = request.IsPrimaryContact;
        person.UpdatedById = userId;

        await _db.SaveChangesAsync(ct);

        return ToResponse(person);
    }

    public async Task<bool> ArchiveMemberAsync(Guid userId, Guid memberId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var person = await _db.FamilyPersons
            .FirstOrDefaultAsync(p => p.Id == memberId && p.FamilyId == familyId && p.ArchivedAt == null, ct);

        if (person is null)
            return false;

        person.ArchivedAt = DateTimeOffset.UtcNow;
        person.UpdatedById = userId;

        await _db.SaveChangesAsync(ct);

        return true;
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
            throw new ForbiddenException("You must be part of a family to manage family members.");

        return familyId.Value;
    }

    private static FamilyMemberResponse ToResponse(FamilyPerson p) =>
        new(p.Id, p.FamilyId, p.DisplayName, p.Relationship, p.AgeGroup,
            p.PrimaryEcosystem, p.IsPrimaryContact, p.CreatedAt, p.UpdatedAt);
}
