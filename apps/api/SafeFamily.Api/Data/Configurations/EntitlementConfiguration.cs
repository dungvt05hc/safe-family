using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Entitlements;

namespace SafeFamily.Api.Data.Configurations;

public class EntitlementConfiguration : AuditableEntityConfiguration<Entitlement>
{
    public override void Configure(EntityTypeBuilder<Entitlement> builder)
    {
        base.Configure(builder);

        builder.ToTable("entitlements");

        builder.Property(e => e.EntitlementType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(e => e.ResourceType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.StartsAt)
            .IsRequired()
            .HasColumnType("timestamptz");

        builder.Property(e => e.ExpiresAt)
            .HasColumnType("timestamptz");

        builder.Property(e => e.IsActive)
            .IsRequired();

        // ── Relationships ─────────────────────────────────────────────────────

        builder.HasOne(e => e.Family)
            .WithMany()
            .HasForeignKey(e => e.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Indexes ───────────────────────────────────────────────────────────

        // Primary lookup: all entitlements for a family
        builder.HasIndex(e => e.FamilyId);

        // Entitlement-check query: given familyId + type, is there an active unexpired row?
        builder.HasIndex(e => new { e.FamilyId, e.EntitlementType });

        // Admin filtering by active status
        builder.HasIndex(e => e.IsActive);
    }
}
