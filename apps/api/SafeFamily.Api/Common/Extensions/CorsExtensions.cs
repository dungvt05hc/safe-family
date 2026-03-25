namespace SafeFamily.Api.Common.Extensions;

public static class CorsExtensions
{
    public const string PolicyName = "AllowWeb";

    public static IServiceCollection AddCorsPolicy(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var rawOrigins = configuration["AllowedOrigins"] ?? "http://localhost:5173";

        var origins = rawOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        services.AddCors(options =>
        {
            options.AddPolicy(PolicyName, policy =>
                policy
                    .WithOrigins(origins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()); // Required for cookie-based auth
        });

        return services;
    }
}
