namespace SafeFamily.Api.Domain.Tasks;

/// <summary>
/// Indicates the urgency level of a safety task.
/// Stored as a string for readability and migration safety.
/// </summary>
public enum TaskPriority
{
    /// <summary>Must be addressed immediately or within 24 hours.</summary>
    High   = 1,

    /// <summary>Should be addressed within the next week or two.</summary>
    Medium = 2,

    /// <summary>Good practice; address when time permits.</summary>
    Low    = 3,
}
