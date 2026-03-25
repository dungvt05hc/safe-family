using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Data.Configurations;
using SafeFamily.Api.Domain.Assessments;

namespace SafeFamily.Api.Data.Configurations;

public class AssessmentAnswerConfiguration : BaseEntityConfiguration<AssessmentAnswer>
{
    public override void Configure(EntityTypeBuilder<AssessmentAnswer> builder)
    {
        base.Configure(builder);

        builder.ToTable("assessment_answers");

        builder.Property(a => a.AssessmentId).IsRequired();

        builder.Property(a => a.QuestionId)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(a => a.Score).IsRequired();

        // One unique answer per question per assessment
        builder.HasIndex(a => new { a.AssessmentId, a.QuestionId }).IsUnique();
    }
}
