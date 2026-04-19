namespace SafeFamily.Api.Domain.Tasks;

/// <summary>
/// Represents the current state of a safety task in its lifecycle.
/// Stored as a string for readability and migration safety.
/// </summary>
public enum TaskStatus
{
    /// <summary>Task has been created and is awaiting action.</summary>
    Pending    = 0,

    /// <summary>A family member has started working on this task.</summary>
    InProgress = 1,

    /// <summary>Task has been successfully completed.</summary>
    Completed  = 2,

    /// <summary>Task was dismissed or intentionally skipped by the family.</summary>
    Dismissed  = 3,

    /// <summary>
    /// Task was superseded by a newer regenerated task.
    /// The successor task ID is recorded in <see cref="SafetyTask.SupersededByTaskId"/>.
    /// </summary>
    Superseded = 4,
}
