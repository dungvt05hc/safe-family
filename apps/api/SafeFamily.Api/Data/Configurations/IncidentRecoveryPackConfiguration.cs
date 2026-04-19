using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Incidents;

namespace SafeFamily.Api.Data.Configurations;

public class IncidentRecoveryPackConfiguration : AuditableEntityConfiguration<IncidentRecoveryPack>
{
    public override void Configure(EntityTypeBuilder<IncidentRecoveryPack> builder)
    {
        base.Configure(builder);

        builder.ToTable("incident_recovery_packs");

        builder.Property(p => p.WhatHappened).IsRequired();
        builder.Property(p => p.WhatToDoNow).IsRequired();
        builder.Property(p => p.WhatNotToDo).IsRequired();
        builder.Property(p => p.Next24Hours).IsRequired();
        builder.Property(p => p.Next7Days).IsRequired();

        builder.Property(p => p.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        // ── Relationships ─────────────────────────────────────────────────────

        builder.HasOne(p => p.Family)
            .WithMany()
            .HasForeignKey(p => p.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Indexes ───────────────────────────────────────────────────────────

        builder.HasIndex(p => p.FamilyId);

        // One recovery pack per booking
        builder.HasIndex(p => p.BookingId).IsUnique();

        builder.HasIndex(p => p.LinkedIncidentId);
    }
}
