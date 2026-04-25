using Microsoft.AspNetCore.Identity;
using SafeFamily.Api.Common.Extensions;
using SafeFamily.Api.Common.Middleware;
using SafeFamily.Api.Common.Services;
using SafeFamily.Api.Domain.Users;
using SafeFamily.Api.Features.Accounts;
using SafeFamily.Api.Features.Admin;
using SafeFamily.Api.Features.Auth;
using SafeFamily.Api.Features.Assessments;
using SafeFamily.Api.Features.Checklists;
using SafeFamily.Api.Features.Bookings;
using SafeFamily.Api.Features.Payments;
using SafeFamily.Api.Features.Payments.Gateways;
using SafeFamily.Api.Infrastructure.BackgroundServices;
using SafeFamily.Api.Features.Dashboard;
using SafeFamily.Api.Features.DeviceCatalog;
using SafeFamily.Api.Features.Devices;
using SafeFamily.Api.Features.Families;
using SafeFamily.Api.Features.Incidents;
using SafeFamily.Api.Features.Entitlements;
using SafeFamily.Api.Features.Tasks;
using SafeFamily.Api.Features.Tasks.Generation;
using SafeFamily.Api.Features.Fulfillment.Handlers;
using SafeFamily.Api.Features.Plans;
using SafeFamily.Api.Features.Reports;
using SafeFamily.Api.Features.Settings;
using SafeFamily.Api.Common.FeatureFlags;

var builder = WebApplication.CreateBuilder(args);

// ── Services ────────────────────────────────────────────────────────────────────────────
builder.Services.Configure<FeatureFlagsSettings>(
    builder.Configuration.GetSection(FeatureFlagsSettings.SectionName));

builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        // Serialize enum values as their name strings (e.g. "Low" not 0).
        opts.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        // Make the camelCase property naming explicit (ASP.NET Core sets this by default,
        // but being explicit prevents surprises if the default ever changes).
        opts.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddSwaggerDocs();
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddCorsPolicy(builder.Configuration);
builder.Services.AddAuthConfiguration(builder.Configuration);
builder.Services.AddSecurityServices();

// Auth feature
builder.Services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Families feature
builder.Services.AddScoped<IFamilyService, FamilyService>();
builder.Services.AddScoped<IFamilyMemberService, FamilyMemberService>();

// Accounts feature
builder.Services.AddScoped<IAccountService, AccountService>();

// Devices feature
builder.Services.AddScoped<IDeviceService, DeviceService>();

// Device Catalog feature
builder.Services.AddScoped<IDeviceCatalogService, DeviceCatalogService>();

// Assessments feature
builder.Services.AddScoped<RiskScoringService>();
builder.Services.AddScoped<IAssessmentService, AssessmentService>();

// Checklists feature
builder.Services.AddScoped<ChecklistGenerationService>();
builder.Services.AddScoped<IChecklistService, ChecklistService>();

// Incidents feature
builder.Services.AddScoped<IIncidentService, IncidentService>();

// Safety Tasks feature
builder.Services.AddScoped<ISafetyTaskService, SafetyTaskService>();
builder.Services.AddScoped<ISafetyTaskGenerationService, SafetyTaskGenerationService>();
builder.Services.AddScoped<ISafetyTaskLifecycleService, SafetyTaskLifecycleService>();

// Bookings feature
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IFulfillmentService, FulfillmentService>();
builder.Services.AddScoped<FreeCheckHandler>();
builder.Services.AddScoped<FamilySafetyPlanHandler>();
builder.Services.AddScoped<IncidentRecoveryPackHandler>();
builder.Services.AddScoped<AnnualSafetyPlanHandler>();
builder.Services.AddScoped<GenericPackageHandler>();

// Entitlements feature
builder.Services.AddScoped<IEntitlementService, EntitlementService>();

// Plans feature
builder.Services.AddScoped<IPlansService, PlansService>();

// Payment feature
builder.Services.Configure<PaymentSettings>(builder.Configuration.GetSection(PaymentSettings.SectionName));

var paymentCfg = builder.Configuration
    .GetSection(PaymentSettings.SectionName)
    .Get<PaymentSettings>() ?? new PaymentSettings();

// Named HttpClients — base addresses come from config so they can be overridden per environment.
builder.Services.AddHttpClient("payos", c =>
{
    c.BaseAddress = new Uri(paymentCfg.PayOs.BaseUrl);
    c.DefaultRequestHeaders.Add("x-client-id", paymentCfg.PayOs.ClientId);
    c.DefaultRequestHeaders.Add("x-api-key",   paymentCfg.PayOs.ApiKey);
});
builder.Services.AddHttpClient("momo",    c => c.BaseAddress = new Uri(paymentCfg.MoMo.BaseUrl));
builder.Services.AddHttpClient("zalopay", c => c.BaseAddress = new Uri(paymentCfg.ZaloPay.BaseUrl));

// All gateway implementations are registered so PaymentService / PaymentWebhookService can
// resolve the correct one at runtime via IEnumerable<IPaymentGateway>.
builder.Services.AddScoped<IPaymentGateway, MockPaymentGateway>();
builder.Services.AddScoped<IPaymentGateway, PayOsGateway>();
builder.Services.AddScoped<IPaymentGateway, MoMoGateway>();
builder.Services.AddScoped<IPaymentGateway, ZaloPayGateway>();

builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IPaymentWebhookService, PaymentWebhookService>();
builder.Services.AddHostedService<PaymentExpiryService>();
builder.Services.AddHostedService<AnnualPlanRefreshService>();

// Dashboard feature
builder.Services.AddScoped<IDashboardService, DashboardService>();

// Reports feature
builder.Services.AddScoped<IReportService, ReportService>();

// Settings feature
builder.Services.AddScoped<ISettingsService, SettingsService>();

// Admin feature
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IAdminTaskService, AdminTaskService>();

var app = builder.Build();

// ── Middleware pipeline ────────────────────────────────────────────────────────
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseHttpsRedirection();
app.UseSecurityHeaders();

if (app.Environment.IsDevelopment())
    app.UseSwaggerDocs();

app.UseCors(CorsExtensions.PolicyName);
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
