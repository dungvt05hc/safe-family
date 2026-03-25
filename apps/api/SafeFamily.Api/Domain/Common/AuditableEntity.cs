namespace SafeFamily.Api.Domain.Common;

/// <summary>
/// Extends BaseEntity with soft record-keeping of who created/last modified
/// a record. Wire userId values in AppDbContext.SaveChangesAsync via
/// ICurrentUserService once authentication is in place.
/// </summary>
public abstract class AuditableEntity : BaseEntity
{
    public Guid? CreatedById { get; set; }
    public Guid? UpdatedById { get; set; }
}
