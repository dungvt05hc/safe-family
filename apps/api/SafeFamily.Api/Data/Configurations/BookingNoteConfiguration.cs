using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Bookings;

namespace SafeFamily.Api.Data.Configurations;

public class BookingNoteConfiguration : BaseEntityConfiguration<BookingNote>
{
    public override void Configure(EntityTypeBuilder<BookingNote> builder)
    {
        base.Configure(builder);

        builder.ToTable("booking_notes");

        builder.Property(n => n.Content)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(n => n.AuthorEmail)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasOne(n => n.Booking)
            .WithMany()
            .HasForeignKey(n => n.BookingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
