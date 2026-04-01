using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Data.Seed;
using SafeFamily.Api.Domain.Devices;

namespace SafeFamily.Api.Data.Configurations;

public class DeviceCatalogBrandConfiguration : BaseEntityConfiguration<DeviceCatalogBrand>
{
    public override void Configure(EntityTypeBuilder<DeviceCatalogBrand> builder)
    {
        base.Configure(builder);

        builder.ToTable("device_catalog_brands");

        builder.Property(b => b.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(b => b.Code)
            .IsUnique();

        builder.Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(b => b.IsActive)
            .IsRequired();

        builder.Property(b => b.SortOrder)
            .IsRequired();

        builder.HasData(DeviceCatalogSeedData.GetBrands());
    }
}
