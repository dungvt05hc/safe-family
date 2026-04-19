namespace SafeFamily.Api.Domain.Tasks;

/// <summary>
/// Classifies events recorded in the <see cref="TaskEvent"/> lifecycle log.
/// Stored as a string for readability and migration safety.
/// </summary>
public enum TaskEventType
{
    /// <summary>Task was first created.</summary>
    Created      = 0,

    /// <summary>Task status changed (e.g. Pending → Completed).</summary>
    StatusChanged = 1,

    /// <summary>Task content or metadata was updated.</summary>
    Updated      = 2,

    /// <summary>A regeneration was requested for this task.</summary>
    RegenerationRequested = 3,

    /// <summary>This task was superseded by a newer regenerated task.</summary>
    Superseded   = 4,
}
