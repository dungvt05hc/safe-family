namespace SafeFamily.Api.Domain.Common;

/// <summary>
/// Root for every domain entity. Provides a Guid primary key and
/// UTC timestamps that are automatically maintained by AppDbContext.
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
