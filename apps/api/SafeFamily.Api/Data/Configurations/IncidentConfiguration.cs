using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Incidents;

namespace SafeFamily.Api.Data.Configurations;

public class IncidentConfiguration : AuditableEntityConfiguration<Incident>
{
    public override void Configure(EntityTypeBuilder<Incident> builder)
    {
        base.Configure(builder);

        builder.ToTable("incidents");

        builder.Property(i => i.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(40);

        builder.Property(i => i.Severity)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(i => i.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(Domain.Incidents.IncidentStatus.Open);

        builder.Property(i => i.Summary)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(i => i.FirstActionPlan)
            .HasMaxLength(2000);

        builder.HasOne(i => i.Family)
            .WithMany()
            .HasForeignKey(i => i.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
