using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Families;
using SafeFamily.Api.Features.Families.Dtos;

namespace SafeFamily.Api.Features.Families;

public class FamilyService : IFamilyService
{
    private readonly AppDbContext _db;

    public FamilyService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<FamilyResponse> CreateFamilyAsync(Guid userId, CreateFamilyRequest request, CancellationToken ct = default)
    {
        var alreadyMember = await _db.FamilyMembers
            .AnyAsync(m => m.UserId == userId, ct);

        if (alreadyMember)
            throw new ConflictException("You are already a member of a family.");

        var family = new Family
        {
            DisplayName = request.DisplayName.Trim(),
            CountryCode = request.CountryCode.ToUpperInvariant(),
            Timezone = request.Timezone.Trim(),
            CreatedById = userId,
            UpdatedById = userId,
        };

        var ownerMembership = new FamilyMember
        {
            FamilyId = family.Id,
            UserId = userId,
            Role = FamilyMemberRole.Owner,
        };

        _db.Families.Add(family);
        _db.FamilyMembers.Add(ownerMembership);
        await _db.SaveChangesAsync(ct);

        return ToResponse(family);
    }

    public async Task<FamilyResponse?> GetMyFamilyAsync(Guid userId, CancellationToken ct = default)
    {
        var family = await _db.FamilyMembers
            .Where(m => m.UserId == userId)
            .Select(m => m.Family)
            .FirstOrDefaultAsync(ct);

        return family is null ? null : ToResponse(family);
    }

    private static FamilyResponse ToResponse(Family family) =>
        new(family.Id, family.DisplayName, family.CountryCode, family.Timezone, family.CreatedAt);
}
