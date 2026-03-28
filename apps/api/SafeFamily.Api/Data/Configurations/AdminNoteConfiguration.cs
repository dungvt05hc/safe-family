using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Admin;

namespace SafeFamily.Api.Data.Configurations;

public class AdminNoteConfiguration : BaseEntityConfiguration<AdminNote>
{
    public override void Configure(EntityTypeBuilder<AdminNote> builder)
    {
        base.Configure(builder);

        builder.ToTable("admin_notes");

        builder.Property(n => n.Content)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(n => n.AuthorEmail)
            .IsRequired()
            .HasMaxLength(256);

        builder.HasOne(n => n.Family)
            .WithMany()
            .HasForeignKey(n => n.FamilyId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(n => n.Booking)
            .WithMany()
            .HasForeignKey(n => n.BookingId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(n => n.Incident)
            .WithMany()
            .HasForeignKey(n => n.IncidentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(n => n.FamilyId);
        builder.HasIndex(n => n.BookingId);
        builder.HasIndex(n => n.IncidentId);
        builder.HasIndex(n => n.CreatedAt);
    }
}
