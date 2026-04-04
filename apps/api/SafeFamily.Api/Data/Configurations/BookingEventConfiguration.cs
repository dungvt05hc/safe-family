using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Bookings;

namespace SafeFamily.Api.Data.Configurations;

public class BookingEventConfiguration : BaseEntityConfiguration<BookingEvent>
{
    public override void Configure(EntityTypeBuilder<BookingEvent> builder)
    {
        base.Configure(builder);

        builder.ToTable("booking_events");

        builder.Property(e => e.EventType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.FromValue)
            .HasMaxLength(50);

        builder.Property(e => e.ToValue)
            .HasMaxLength(50);

        builder.Property(e => e.Description)
            .HasMaxLength(1000);

        builder.Property(e => e.ActorEmail)
            .HasMaxLength(200);

        // ── Relationships ─────────────────────────────────────────────────────
        builder.HasOne(e => e.Booking)
            .WithMany(b => b.Events)
            .HasForeignKey(e => e.BookingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
