using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Bookings;

namespace SafeFamily.Api.Data.Configurations;

public class BookingConfiguration : AuditableEntityConfiguration<Booking>
{
    public override void Configure(EntityTypeBuilder<Booking> builder)
    {
        base.Configure(builder);

        builder.ToTable("bookings");

        // ── Package snapshot ──────────────────────────────────────────────────
        builder.Property(b => b.SnapshotPackageName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(b => b.SnapshotPackageCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(b => b.SnapshotPrice)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(b => b.SnapshotCurrency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(b => b.SnapshotDurationMinutes)
            .IsRequired();

        // ── Scheduling ────────────────────────────────────────────────────────
        builder.Property(b => b.PreferredStartAt)
            .IsRequired()
            .HasColumnType("timestamptz");

        builder.Property(b => b.ConfirmedStartAt)
            .HasColumnType("timestamptz");

        builder.Property(b => b.ConfirmedEndAt)
            .HasColumnType("timestamptz");

        // ── Channel & source ──────────────────────────────────────────────────
        builder.Property(b => b.Channel)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(b => b.Source)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        // ── Notes ─────────────────────────────────────────────────────────────
        builder.Property(b => b.CustomerNotes)
            .HasMaxLength(1000);

        builder.Property(b => b.InternalNotes)
            .HasMaxLength(2000);

        // ── Status ────────────────────────────────────────────────────────────
        builder.Property(b => b.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(b => b.PaymentStatus)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(b => b.ExpiresAt)
            .HasColumnType("timestamptz");

        builder.Property(b => b.CompletedAt)
            .HasColumnType("timestamptz");

        // ── Admin ─────────────────────────────────────────────────────────────
        builder.Property(b => b.AssignedAdminUserId);

        builder.Property(b => b.AssignedAdminEmail)
            .HasMaxLength(200);

        // ── Relationships ─────────────────────────────────────────────────────
        builder.HasOne(b => b.Family)
            .WithMany()
            .HasForeignKey(b => b.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(b => b.Package)
            .WithMany(p => p.Bookings)
            .HasForeignKey(b => b.PackageId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

