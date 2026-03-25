using SafeFamily.Api.Domain.Common;
using SafeFamily.Api.Domain.Users;

namespace SafeFamily.Api.Domain.Families;

/// <summary>
/// Join entity linking a User to a Family. Each user may belong to at most
/// one family; the unique index (FamilyId, UserId) is enforced in EF config.
/// </summary>
public class FamilyMember : BaseEntity
{
    public Guid FamilyId { get; set; }
    public Guid UserId { get; set; }
    public FamilyMemberRole Role { get; set; }

    public Family Family { get; set; } = null!;
    public User User { get; set; } = null!;
}
