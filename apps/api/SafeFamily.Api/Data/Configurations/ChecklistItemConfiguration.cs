using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Checklists;

namespace SafeFamily.Api.Data.Configurations;

public class ChecklistItemConfiguration : BaseEntityConfiguration<ChecklistItem>
{
    public override void Configure(EntityTypeBuilder<ChecklistItem> builder)
    {
        base.Configure(builder);

        builder.ToTable("checklist_items");

        builder.Property(c => c.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(c => c.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(c => c.Category)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(c => c.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.Priority)
            .IsRequired();

        builder.Property(c => c.SourceType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.SourceId)
            .HasMaxLength(200);

        builder.Property(c => c.DueAt);

        builder.Property(c => c.HelpUrl)
            .HasMaxLength(500);

        builder.HasOne(c => c.Family)
            .WithMany()
            .HasForeignKey(c => c.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        // Unique per family + source rule so reconciliation works correctly
        builder.HasIndex(c => new { c.FamilyId, c.SourceId })
            .IsUnique()
            .HasFilter("\"SourceId\" IS NOT NULL");
    }
}
