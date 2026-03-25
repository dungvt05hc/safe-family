using SafeFamily.Api.Domain.Common;

namespace SafeFamily.Api.Infrastructure.Repositories;

/// <summary>
/// Generic repository contract. Feature-specific repositories should extend
/// this interface (and optionally IRepository&lt;T&gt;) to add domain queries.
/// </summary>
public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<T>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(T entity, CancellationToken ct = default);
    void Update(T entity);
    void Remove(T entity);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
