using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Data.Configurations;

public class FamilyMemberConfiguration : BaseEntityConfiguration<FamilyMember>
{
    public override void Configure(EntityTypeBuilder<FamilyMember> builder)
    {
        base.Configure(builder);

        builder.ToTable("family_members");

        // Store enum as its string name for readability in the database.
        builder.Property(m => m.Role)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        // A user can only belong to one family.
        builder.HasIndex(m => m.UserId).IsUnique();

        // A user-family pair must be unique (defensive; covered by the UserId unique index above).
        builder.HasIndex(m => new { m.FamilyId, m.UserId }).IsUnique();

        builder.HasOne(m => m.Family)
            .WithMany(f => f.Members)
            .HasForeignKey(m => m.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.User)
            .WithMany()
            .HasForeignKey(m => m.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
