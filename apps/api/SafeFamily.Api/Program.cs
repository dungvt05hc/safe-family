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
using SafeFamily.Api.Features.Dashboard;
using SafeFamily.Api.Features.Devices;
using SafeFamily.Api.Features.Families;
using SafeFamily.Api.Features.Incidents;
using SafeFamily.Api.Features.Reports;
using SafeFamily.Api.Features.Settings;

var builder = WebApplication.CreateBuilder(args);

// ── Services ────────────────────────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
        opts.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()));
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

// Assessments feature
builder.Services.AddScoped<RiskScoringService>();
builder.Services.AddScoped<IAssessmentService, AssessmentService>();

// Checklists feature
builder.Services.AddScoped<ChecklistGenerationService>();
builder.Services.AddScoped<IChecklistService, ChecklistService>();

// Incidents feature
builder.Services.AddScoped<IIncidentService, IncidentService>();

// Bookings feature
builder.Services.AddScoped<IBookingService, BookingService>();

// Dashboard feature
builder.Services.AddScoped<IDashboardService, DashboardService>();

// Reports feature
builder.Services.AddScoped<IReportService, ReportService>();

// Settings feature
builder.Services.AddScoped<ISettingsService, SettingsService>();

// Admin feature
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IAdminService, AdminService>();

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
