using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Data.Seed;
using SafeFamily.Api.Domain.Devices;

namespace SafeFamily.Api.Data.Configurations;

public class DeviceCatalogOsFamilyConfiguration : BaseEntityConfiguration<DeviceCatalogOsFamily>
{
    public override void Configure(EntityTypeBuilder<DeviceCatalogOsFamily> builder)
    {
        base.Configure(builder);

        builder.ToTable("device_catalog_os_families");

        builder.Property(o => o.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(o => o.Code)
            .IsUnique();

        builder.Property(o => o.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(o => o.IsActive)
            .IsRequired();

        builder.Property(o => o.SortOrder)
            .IsRequired();

        builder.HasData(DeviceCatalogSeedData.GetOsFamilies());
    }
}
