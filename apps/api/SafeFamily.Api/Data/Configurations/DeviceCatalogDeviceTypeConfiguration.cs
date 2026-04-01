using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Data.Seed;
using SafeFamily.Api.Domain.Devices;

namespace SafeFamily.Api.Data.Configurations;

public class DeviceCatalogDeviceTypeConfiguration : BaseEntityConfiguration<DeviceCatalogDeviceType>
{
    public override void Configure(EntityTypeBuilder<DeviceCatalogDeviceType> builder)
    {
        base.Configure(builder);

        builder.ToTable("device_catalog_device_types");

        builder.Property(d => d.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(d => d.Code)
            .IsUnique();

        builder.Property(d => d.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(d => d.IsActive)
            .IsRequired();

        builder.Property(d => d.SortOrder)
            .IsRequired();

        builder.HasData(DeviceCatalogSeedData.GetDeviceTypes());
    }
}
