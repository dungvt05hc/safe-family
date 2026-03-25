namespace SafeFamily.Api.Common.Services;

public interface IAuditLogService
{
    Task LogAsync(
        string action,
        Guid? userId       = null,
        string? userEmail  = null,
        string? entityType = null,
        Guid? entityId     = null,
        string? details    = null,
        string? ipAddress  = null,
        CancellationToken ct = default);
}
