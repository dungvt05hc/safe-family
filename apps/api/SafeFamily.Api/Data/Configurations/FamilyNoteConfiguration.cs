using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Admin;

namespace SafeFamily.Api.Data.Configurations;

public class FamilyNoteConfiguration : BaseEntityConfiguration<FamilyNote>
{
    public override void Configure(EntityTypeBuilder<FamilyNote> builder)
    {
        base.Configure(builder);

        builder.ToTable("family_notes");

        builder.Property(n => n.Content)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(n => n.AuthorEmail)
            .IsRequired()
            .HasMaxLength(256);

        builder.HasOne(n => n.Family)
            .WithMany()
            .HasForeignKey(n => n.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(n => n.FamilyId);
        builder.HasIndex(n => n.CreatedAt);
    }
}
