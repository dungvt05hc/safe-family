using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Reports;

namespace SafeFamily.Api.Data.Configurations;

public class ReportConfiguration : BaseEntityConfiguration<Report>
{
    public override void Configure(EntityTypeBuilder<Report> builder)
    {
        base.Configure(builder);

        builder.ToTable("reports");

        builder.Property(r => r.ReportType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(r => r.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(r => r.Description)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(r => r.FileUrl)
            .HasMaxLength(1000);

        builder.Property(r => r.GeneratedAt)
            .IsRequired()
            .HasColumnType("timestamptz");

        builder.Property(r => r.BookingId);
        builder.Property(r => r.IncidentId);
        builder.Property(r => r.CreatedByUserId);

        builder.HasOne(r => r.Family)
            .WithMany()
            .HasForeignKey(r => r.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(r => r.FamilyId);
        builder.HasIndex(r => new { r.FamilyId, r.GeneratedAt });
    }
}
