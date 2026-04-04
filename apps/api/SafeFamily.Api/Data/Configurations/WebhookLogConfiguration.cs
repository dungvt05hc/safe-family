using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Bookings;

namespace SafeFamily.Api.Data.Configurations;

public class WebhookLogConfiguration : BaseEntityConfiguration<WebhookLog>
{
    public override void Configure(EntityTypeBuilder<WebhookLog> builder)
    {
        base.Configure(builder);

        builder.ToTable("webhook_logs");

        builder.Property(w => w.Provider)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(w => w.GatewayOrderId)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(w => w.EventType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(w => w.GatewayTransactionId)
            .HasMaxLength(200);

        builder.Property(w => w.ProcessingNote)
            .HasMaxLength(200);

        // RawBody: raw gateway JSON — kept as unbounded TEXT (typically < 10 KB)
        builder.Property(w => w.RawBody)
            .IsRequired();

        // ── Idempotency unique constraint ─────────────────────────────────────
        // Prevents double-processing a gateway event even under concurrent delivery.
        // Inserting a duplicate (provider, gateway_order_id, event_type) row will
        // throw PostgresException SqlState 23505, which PaymentWebhookService catches
        // and translates into a safe 200 acknowledgement.
        builder.HasIndex(w => new { w.Provider, w.GatewayOrderId, w.EventType })
            .IsUnique()
            .HasDatabaseName("IX_webhook_logs_provider_order_event");

        // ── Performance indexes ───────────────────────────────────────────────
        builder.HasIndex(w => w.GatewayOrderId)
            .HasDatabaseName("IX_webhook_logs_gateway_order_id");

        builder.HasIndex(w => w.CreatedAt)
            .HasDatabaseName("IX_webhook_logs_created_at");
    }
}
