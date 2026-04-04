using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Bookings;

namespace SafeFamily.Api.Data.Configurations;

public class PaymentOrderConfiguration : BaseEntityConfiguration<PaymentOrder>
{
    public override void Configure(EntityTypeBuilder<PaymentOrder> builder)
    {
        base.Configure(builder);

        builder.ToTable("payment_orders");

        builder.Property(p => p.Amount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(p => p.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(p => p.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        // ── Gateway fields ────────────────────────────────────────────────────
        builder.Property(p => p.GatewayProvider)
            .HasMaxLength(50);

        builder.Property(p => p.GatewayOrderId)
            .HasMaxLength(200);

        builder.Property(p => p.GatewayTransactionId)
            .HasMaxLength(200);

        builder.Property(p => p.PaymentUrl)
            .HasMaxLength(2048);

        builder.Property(p => p.QrCodeUrl)
            .HasMaxLength(2048);

        // Stored as raw JSONB for efficient Postgres storage and future querying.
        builder.Property(p => p.GatewayRawResponse)
            .HasColumnType("jsonb");

        // ── Lifecycle timestamps ──────────────────────────────────────────────
        builder.Property(p => p.PaidAt)
            .HasColumnType("timestamptz");

        builder.Property(p => p.ExpiresAt)
            .HasColumnType("timestamptz");

        builder.Property(p => p.FailedAt)
            .HasColumnType("timestamptz");

        builder.Property(p => p.RefundedAt)
            .HasColumnType("timestamptz");

        builder.Property(p => p.RefundedAmount)
            .HasPrecision(18, 2);

        // ── Relationships ─────────────────────────────────────────────────────
        builder.HasOne(p => p.Booking)
            .WithMany(b => b.PaymentOrders)
            .HasForeignKey(p => p.BookingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
