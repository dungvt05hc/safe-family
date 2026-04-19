namespace SafeFamily.Api.Domain.Checklists;

/// <summary>
/// Identifies the type of domain object that a safety task is directed at.
/// Enables the UI to show context-specific target information (e.g. "John's iPhone").
/// </summary>
public enum SafeTaskTargetType
{
    /// <summary>Task applies to the whole family.</summary>
    Family       = 0,

    /// <summary>Task is directed at a specific family member.</summary>
    FamilyMember = 1,

    /// <summary>Task is directed at a specific device.</summary>
    Device       = 2,

    /// <summary>Task is directed at a specific account.</summary>
    Account      = 3,
}
