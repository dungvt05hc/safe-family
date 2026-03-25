using SafeFamily.Api.Features.Families.Dtos;

namespace SafeFamily.Api.Features.Families;

public interface IFamilyMemberService
{
    /// <summary>Lists all active (non-archived) members of the authenticated user's family.</summary>
    Task<IReadOnlyList<FamilyMemberResponse>> GetMembersAsync(Guid userId, CancellationToken ct = default);

    /// <summary>Creates a new family member profile. Requires the user to belong to a family.</summary>
    Task<FamilyMemberResponse> CreateMemberAsync(Guid userId, CreateFamilyMemberRequest request, CancellationToken ct = default);

    /// <summary>Updates an existing family member. Returns null if not found within the user's family.</summary>
    Task<FamilyMemberResponse?> UpdateMemberAsync(Guid userId, Guid memberId, UpdateFamilyMemberRequest request, CancellationToken ct = default);

    /// <summary>Soft-archives a family member. Returns false if not found within the user's family.</summary>
    Task<bool> ArchiveMemberAsync(Guid userId, Guid memberId, CancellationToken ct = default);
}
