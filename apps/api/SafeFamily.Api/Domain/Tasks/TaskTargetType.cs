namespace SafeFamily.Api.Domain.Tasks;

/// <summary>
/// Identifies the type of domain object a safety task is directed at.
/// Stored as a string for readability and migration safety.
/// </summary>
public enum TaskTargetType
{
    /// <summary>Task applies to the family as a whole.</summary>
    Family       = 0,

    /// <summary>Task is directed at a specific family member.</summary>
    FamilyMember = 1,

    /// <summary>Task is directed at a specific device.</summary>
    Device       = 2,

    /// <summary>Task is directed at a specific digital account.</summary>
    Account      = 3,
}
