using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Data.Configurations;

public class FamilyConfiguration : AuditableEntityConfiguration<Family>
{
    public override void Configure(EntityTypeBuilder<Family> builder)
    {
        base.Configure(builder);

        builder.ToTable("families");

        builder.Property(f => f.DisplayName)
            .IsRequired()
            .HasMaxLength(200);

        // ISO 3166-1 alpha-2 — always exactly 2 uppercase characters.
        builder.Property(f => f.CountryCode)
            .IsRequired()
            .HasMaxLength(2)
            .IsFixedLength();

        builder.Property(f => f.Timezone)
            .IsRequired()
            .HasMaxLength(100);
    }
}
