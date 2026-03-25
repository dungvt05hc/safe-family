using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Admin;

namespace SafeFamily.Api.Common.Services;

public class AuditLogService : IAuditLogService
{
    private readonly AppDbContext _db;

    public AuditLogService(AppDbContext db)
    {
        _db = db;
    }

    public async Task LogAsync(
        string action,
        Guid? userId       = null,
        string? userEmail  = null,
        string? entityType = null,
        Guid? entityId     = null,
        string? details    = null,
        string? ipAddress  = null,
        CancellationToken ct = default)
    {
        _db.AuditLogs.Add(new AuditLog
        {
            Action     = action,
            UserId     = userId,
            UserEmail  = userEmail,
            EntityType = entityType,
            EntityId   = entityId,
            Details    = details,
            IpAddress  = ipAddress,
        });

        await _db.SaveChangesAsync(ct);
    }
}
