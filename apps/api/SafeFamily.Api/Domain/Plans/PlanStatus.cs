namespace SafeFamily.Api.Domain.Plans;

/// <summary>
/// Lifecycle state of an auto-generated digital safety plan document.
/// </summary>
public enum PlanStatus
{
    /// <summary>Content has been auto-generated from family data; awaiting advisor review.</summary>
    Generated = 0,

    /// <summary>An advisor has reviewed the auto-generated content and may have edited it.</summary>
    Reviewed  = 1,

    /// <summary>The plan has been finalised and the family can access the full report.</summary>
    Published = 2,
}
