using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Devices;

namespace SafeFamily.Api.Data.Configurations;

public class DeviceConfiguration : AuditableEntityConfiguration<Device>
{
    public override void Configure(EntityTypeBuilder<Device> builder)
    {
        base.Configure(builder);

        builder.ToTable("devices");

        // ── Legacy free-text (kept nullable for migration period) ──────────────

        #pragma warning disable CS0618 // Obsolete members — still mapped for migration
        builder.Property(d => d.DeviceType)
            .HasConversion<string>()
            .HasMaxLength(30)
            .HasDefaultValue(DeviceType.Other);

        builder.Property(d => d.Brand)
            .HasMaxLength(100)
            .HasDefaultValue(string.Empty);

        builder.Property(d => d.Model)
            .HasMaxLength(200)
            .HasDefaultValue(string.Empty);

        builder.Property(d => d.OsName)
            .HasMaxLength(100)
            .HasDefaultValue(string.Empty);

        builder.Property(d => d.OsVersion)
            .HasMaxLength(50)
            .HasDefaultValue(string.Empty);
        #pragma warning restore CS0618

        // ── Catalog FKs (new) ──────────────────────────────────────────────────

        builder.HasOne(d => d.CatalogDeviceType)
            .WithMany()
            .HasForeignKey(d => d.CatalogDeviceTypeId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(d => d.CatalogBrand)
            .WithMany()
            .HasForeignKey(d => d.CatalogBrandId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(d => d.CatalogModel)
            .WithMany()
            .HasForeignKey(d => d.CatalogModelId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(d => d.CatalogOsFamily)
            .WithMany()
            .HasForeignKey(d => d.CatalogOsFamilyId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(d => d.CatalogOsVersion)
            .WithMany()
            .HasForeignKey(d => d.CatalogOsVersionId)
            .OnDelete(DeleteBehavior.SetNull);

        // ── Other fields ───────────────────────────────────────────────────────

        builder.Property(d => d.SupportStatus)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(40);

        builder.Property(d => d.ScreenLockEnabled).IsRequired();
        builder.Property(d => d.BiometricEnabled).IsRequired();
        builder.Property(d => d.BackupEnabled).IsRequired();
        builder.Property(d => d.FindMyDeviceEnabled).IsRequired();

        builder.Property(d => d.Notes)
            .HasMaxLength(1000);

        builder.Property(d => d.ArchivedAt);

        builder.HasOne(d => d.Family)
            .WithMany()
            .HasForeignKey(d => d.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(d => d.Member)
            .WithMany()
            .HasForeignKey(d => d.MemberId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
