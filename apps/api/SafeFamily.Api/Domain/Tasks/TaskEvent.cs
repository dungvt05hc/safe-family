using SafeFamily.Api.Domain.Common;

namespace SafeFamily.Api.Domain.Tasks;

/// <summary>
/// Immutable audit record of a significant lifecycle event on a <see cref="SafetyTask"/>.
///
/// A new TaskEvent row is appended whenever:
///   - a task is created
///   - a task's status changes
///   - a task's content is updated by an advisor
///   - a regeneration is requested
///   - a task is superseded by a newer replacement
///
/// TaskEvent rows are never updated or deleted — they form an append-only audit trail.
/// </summary>
public class TaskEvent : BaseEntity
{
    public Guid TaskId { get; set; }

    /// <summary>The type of lifecycle event that occurred.</summary>
    public TaskEventType EventType { get; set; }

    /// <summary>Task status before the event, if this is a StatusChanged event.</summary>
    public TaskStatus? OldStatus { get; set; }

    /// <summary>Task status after the event, if this is a StatusChanged event.</summary>
    public TaskStatus? NewStatus { get; set; }

    /// <summary>
    /// Optional free-text notes captured alongside the event.
    /// Examples: advisor comment when updating content, reason for dismissal.
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>The user who triggered this event. Null for system-generated events.</summary>
    public Guid? CreatedById { get; set; }

    // ── Navigation ────────────────────────────────────────────────────────────

    public SafetyTask Task { get; set; } = null!;
}
