using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Options;

namespace SafeFamily.Api.Common.FeatureFlags;

/// <summary>
/// Action filter that short-circuits the request pipeline with <c>503 Service Unavailable</c>
/// when the specified <see cref="FeatureFlag"/> is disabled in configuration.
/// <para>
/// Apply at controller class level to gate all actions, or on individual actions for
/// finer-grained control (e.g. keeping a webhook alive while disabling user-facing
/// payment actions).
/// </para>
/// Usage:
/// <code>
/// [RequireFeature(FeatureFlag.Booking)]
/// public class BookingsController : ControllerBase { ... }
/// </code>
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
public sealed class RequireFeatureAttribute : ActionFilterAttribute
{
    private readonly FeatureFlag _flag;

    public RequireFeatureAttribute(FeatureFlag flag)
    {
        _flag = flag;
    }

    public override void OnActionExecuting(ActionExecutingContext context)
    {
        // IOptionsSnapshot reflects config changes without requiring an app restart.
        var settings = context.HttpContext.RequestServices
            .GetRequiredService<IOptionsSnapshot<FeatureFlagsSettings>>()
            .Value;

        var enabled = _flag switch
        {
            FeatureFlag.Booking      => settings.BookingEnabled,
            FeatureFlag.Payments     => settings.PaymentsEnabled,
            FeatureFlag.PremiumPlans => settings.PremiumPlansEnabled,
            _                        => true,
        };

        if (!enabled)
        {
            context.Result = new ObjectResult(new
            {
                error   = "Feature not available",
                feature = _flag.ToString(),
                message = "This feature is currently disabled.",
            })
            {
                StatusCode = StatusCodes.Status503ServiceUnavailable,
            };
        }
    }
}
