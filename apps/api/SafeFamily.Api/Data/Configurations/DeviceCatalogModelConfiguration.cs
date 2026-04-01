using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Data.Seed;
using SafeFamily.Api.Domain.Devices;

namespace SafeFamily.Api.Data.Configurations;

public class DeviceCatalogModelConfiguration : BaseEntityConfiguration<DeviceCatalogModel>
{
    public override void Configure(EntityTypeBuilder<DeviceCatalogModel> builder)
    {
        base.Configure(builder);

        builder.ToTable("device_catalog_models");

        builder.Property(m => m.Code)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(m => m.Code)
            .IsUnique();

        builder.Property(m => m.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(m => m.IsActive)
            .IsRequired();

        builder.Property(m => m.SortOrder)
            .IsRequired();

        // ── Relationships ──────────────────────────────────────────────────────

        builder.HasOne(m => m.Brand)
            .WithMany(b => b.Models)
            .HasForeignKey(m => m.BrandId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.DeviceType)
            .WithMany(dt => dt.Models)
            .HasForeignKey(m => m.DeviceTypeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.DefaultOsFamily)
            .WithMany(os => os.DefaultModels)
            .HasForeignKey(m => m.DefaultOsFamilyId)
            .OnDelete(DeleteBehavior.SetNull);

        // ── Composite index for the most common query: filter by brand + device type ──
        builder.HasIndex(m => new { m.BrandId, m.DeviceTypeId });

        builder.HasData(DeviceCatalogSeedData.GetModels());
    }
}
