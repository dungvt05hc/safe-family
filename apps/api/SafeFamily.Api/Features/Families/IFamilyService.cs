using SafeFamily.Api.Features.Families.Dtos;

namespace SafeFamily.Api.Features.Families;

public interface IFamilyService
{
    /// <summary>
    /// Creates a new family owned by the specified user.
    /// Throws <see cref="SafeFamily.Api.Common.Exceptions.ConflictException"/> if the user is already a member of a family.
    /// </summary>
    Task<FamilyResponse> CreateFamilyAsync(Guid userId, CreateFamilyRequest request, CancellationToken ct = default);

    /// <summary>
    /// Returns the family the specified user belongs to, or null if they have not joined one.
    /// </summary>
    Task<FamilyResponse?> GetMyFamilyAsync(Guid userId, CancellationToken ct = default);
}
