using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Plans;

namespace SafeFamily.Api.Data.Configurations;

public class FamilySafetyPlanConfiguration : AuditableEntityConfiguration<FamilySafetyPlan>
{
    public override void Configure(EntityTypeBuilder<FamilySafetyPlan> builder)
    {
        base.Configure(builder);

        builder.ToTable("family_safety_plans");

        builder.Property(p => p.AssessmentRiskLevel)
            .HasMaxLength(20);

        builder.Property(p => p.TopRisks)
            .IsRequired();

        builder.Property(p => p.TopPriorities)
            .IsRequired();

        builder.Property(p => p.ActionPlanByMember)
            .IsRequired();

        builder.Property(p => p.ActionPlanByDevice)
            .IsRequired();

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

        // One plan per booking (a booking triggers exactly one plan)
        builder.HasIndex(p => p.BookingId).IsUnique();
    }
}
