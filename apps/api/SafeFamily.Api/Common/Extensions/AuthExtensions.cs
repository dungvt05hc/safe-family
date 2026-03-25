using Microsoft.AspNetCore.Authentication.Cookies;

namespace SafeFamily.Api.Common.Extensions;

public static class AuthExtensions
{
    public static IServiceCollection AddAuthConfiguration(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services
            .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = SameSiteMode.Lax;
                // Always require Secure in production; honour request scheme in development.
                options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
                options.Cookie.Name = "sf_session";
                options.ExpireTimeSpan = TimeSpan.FromDays(7);
                options.SlidingExpiration = true;

                // Return 401/403 JSON instead of redirecting — this is an API, not a web app.
                options.Events.OnRedirectToLogin = ctx =>
                {
                    ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    return Task.CompletedTask;
                };
                options.Events.OnRedirectToAccessDenied = ctx =>
                {
                    ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
                    return Task.CompletedTask;
                };
            });

        services.AddAuthorization(options =>
        {
            options.AddPolicy("Admin", p => p.RequireRole("Admin"));
        });

        return services;
    }
}
