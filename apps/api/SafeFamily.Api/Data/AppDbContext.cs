using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Domain.Accounts;
using SafeFamily.Api.Domain.Admin;
using SafeFamily.Api.Domain.Assessments;
using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Domain.Checklists;
using SafeFamily.Api.Domain.Common;
using SafeFamily.Api.Domain.Devices;
using SafeFamily.Api.Domain.Families;
using SafeFamily.Api.Domain.Incidents;
using SafeFamily.Api.Domain.Reports;
using SafeFamily.Api.Domain.Settings;
using SafeFamily.Api.Domain.Users;

namespace SafeFamily.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Family> Families => Set<Family>();
    public DbSet<FamilyMember> FamilyMembers => Set<FamilyMember>();
    public DbSet<FamilyPerson> FamilyPersons => Set<FamilyPerson>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Device> Devices => Set<Device>();
    public DbSet<DeviceCatalogDeviceType> DeviceCatalogDeviceTypes => Set<DeviceCatalogDeviceType>();
    public DbSet<DeviceCatalogBrand> DeviceCatalogBrands => Set<DeviceCatalogBrand>();
    public DbSet<DeviceCatalogModel> DeviceCatalogModels => Set<DeviceCatalogModel>();
    public DbSet<DeviceCatalogOsFamily> DeviceCatalogOsFamilies => Set<DeviceCatalogOsFamily>();
    public DbSet<DeviceCatalogOsVersion> DeviceCatalogOsVersions => Set<DeviceCatalogOsVersion>();
    public DbSet<Assessment> Assessments => Set<Assessment>();
    public DbSet<AssessmentAnswer> AssessmentAnswers => Set<AssessmentAnswer>();
    public DbSet<ChecklistItem> ChecklistItems => Set<ChecklistItem>();
    public DbSet<Incident> Incidents => Set<Incident>();
    public DbSet<IncidentNote> IncidentNotes => Set<IncidentNote>();
    public DbSet<ServicePackage> ServicePackages => Set<ServicePackage>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<BookingNote> BookingNotes => Set<BookingNote>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<AdminNote> AdminNotes => Set<AdminNote>();
    public DbSet<FamilyNote> FamilyNotes => Set<FamilyNote>();
    public DbSet<Report> Reports => Set<Report>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
                entry.Entity.UpdatedAt = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
