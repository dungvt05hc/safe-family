using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Admin;

namespace SafeFamily.Api.Data.Configurations;

public class AuditLogConfiguration : BaseEntityConfiguration<AuditLog>
{
    public override void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        base.Configure(builder);

        builder.ToTable("audit_logs");

        builder.Property(l => l.Action)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(l => l.UserEmail)
            .HasMaxLength(256);

        builder.Property(l => l.EntityType)
            .HasMaxLength(100);

        builder.Property(l => l.Details)
            .HasMaxLength(500);

        builder.Property(l => l.IpAddress)
            .HasMaxLength(45); // IPv6 max length

        // Index for common admin queries
        builder.HasIndex(l => l.UserId);
        builder.HasIndex(l => l.Action);
        builder.HasIndex(l => l.CreatedAt);
    }
}
