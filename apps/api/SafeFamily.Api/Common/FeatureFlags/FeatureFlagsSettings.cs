namespace SafeFamily.Api.Common.FeatureFlags;

/// <summary>
/// Strongly-typed feature flag settings bound from configuration section "FeatureFlags".
/// All flags default to <c>true</c> so existing deployments keep working without any
/// config change.
/// </summary>
public sealed class FeatureFlagsSettings
{
    public const string SectionName = "FeatureFlags";

    /// <summary>Controls booking creation, listing, and related booking endpoints.</summary>
    public bool BookingEnabled { get; init; } = true;

    /// <summary>Controls payment initiation, retry, sync, and order listing endpoints.</summary>
    public bool PaymentsEnabled { get; init; } = true;

    /// <summary>Controls premium safety plan and incident recovery pack endpoints.</summary>
    public bool PremiumPlansEnabled { get; init; } = true;
}
