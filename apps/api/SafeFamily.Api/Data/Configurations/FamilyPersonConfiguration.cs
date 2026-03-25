using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Data.Configurations;

public class FamilyPersonConfiguration : AuditableEntityConfiguration<FamilyPerson>
{
    public override void Configure(EntityTypeBuilder<FamilyPerson> builder)
    {
        base.Configure(builder);

        builder.ToTable("family_persons");

        builder.Property(p => p.DisplayName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Relationship)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.AgeGroup)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(p => p.PrimaryEcosystem)
            .HasMaxLength(100);

        builder.Property(p => p.IsPrimaryContact)
            .IsRequired();

        builder.Property(p => p.ArchivedAt);

        builder.HasOne(p => p.Family)
            .WithMany()
            .HasForeignKey(p => p.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
