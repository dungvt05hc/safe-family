using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Data.Seed;
using SafeFamily.Api.Domain.Devices;

namespace SafeFamily.Api.Data.Configurations;

public class DeviceCatalogOsVersionConfiguration : BaseEntityConfiguration<DeviceCatalogOsVersion>
{
    public override void Configure(EntityTypeBuilder<DeviceCatalogOsVersion> builder)
    {
        base.Configure(builder);

        builder.ToTable("device_catalog_os_versions");

        builder.Property(v => v.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(v => v.Code)
            .IsUnique();

        builder.Property(v => v.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(v => v.IsActive)
            .IsRequired();

        builder.Property(v => v.SortOrder)
            .IsRequired();

        // ── Relationship ───────────────────────────────────────────────────────

        builder.HasOne(v => v.OsFamily)
            .WithMany(f => f.Versions)
            .HasForeignKey(v => v.OsFamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(v => v.OsFamilyId);

        builder.HasData(DeviceCatalogSeedData.GetOsVersions());
    }
}
