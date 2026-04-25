namespace SafeFamily.Api.Common.FeatureFlags;

/// <summary>
/// Identifies a backend feature that can be enabled or disabled via <see cref="FeatureFlagsSettings"/>.
/// </summary>
public enum FeatureFlag
{
    Booking,
    Payments,
    PremiumPlans,
}
