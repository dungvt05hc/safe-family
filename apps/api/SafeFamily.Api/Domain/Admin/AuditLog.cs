using SafeFamily.Api.Domain.Common;

namespace SafeFamily.Api.Domain.Admin;

/// <summary>
/// Immutable audit trail entry. Never updated — only inserted.
/// </summary>
public class AuditLog : BaseEntity
{
    /// <summary>Short action name, e.g. "LoginSuccess", "BookingCreated".</summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>The user who performed the action (null for anonymous/failed logins).</summary>
    public Guid? UserId { get; set; }

    /// <summary>Denormalised email for display without a JOIN.</summary>
    public string? UserEmail { get; set; }

    /// <summary>Domain entity type that was affected, e.g. "Booking", "Incident".</summary>
    public string? EntityType { get; set; }

    /// <summary>PK of the affected entity.</summary>
    public Guid? EntityId { get; set; }

    /// <summary>Optional free-text context (brief, no PII).</summary>
    public string? Details { get; set; }

    /// <summary>Client IP, logged at the edge; used for abuse detection only.</summary>
    public string? IpAddress { get; set; }
}
