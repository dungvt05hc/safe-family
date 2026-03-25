using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Data.Configurations;
using SafeFamily.Api.Domain.Assessments;

namespace SafeFamily.Api.Data.Configurations;

public class AssessmentConfiguration : AuditableEntityConfiguration<Assessment>
{
    public override void Configure(EntityTypeBuilder<Assessment> builder)
    {
        base.Configure(builder);

        builder.ToTable("assessments");

        builder.Property(a => a.FamilyId).IsRequired();

        builder.Property(a => a.OverallScore).IsRequired();
        builder.Property(a => a.AccountSecurityScore).IsRequired();
        builder.Property(a => a.DeviceHygieneScore).IsRequired();
        builder.Property(a => a.BackupRecoveryScore).IsRequired();
        builder.Property(a => a.PrivacySharingScore).IsRequired();
        builder.Property(a => a.ScamReadinessScore).IsRequired();

        builder.Property(a => a.RiskLevel)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasOne(a => a.Family)
            .WithMany()
            .HasForeignKey(a => a.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(a => a.Answers)
            .WithOne(ans => ans.Assessment)
            .HasForeignKey(ans => ans.AssessmentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
