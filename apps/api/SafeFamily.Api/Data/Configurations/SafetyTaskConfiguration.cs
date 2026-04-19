using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Data.Configurations;
using SafeFamily.Api.Domain.Tasks;

namespace SafeFamily.Api.Data.Configurations;

public class SafetyTaskConfiguration : BaseEntityConfiguration<SafetyTask>
{
    public override void Configure(EntityTypeBuilder<SafetyTask> builder)
    {
        base.Configure(builder);

        builder.ToTable("safety_tasks");

        // ── Family scope ──────────────────────────────────────────────────────

        builder.Property(t => t.FamilyId)
            .IsRequired();

        // ── Source tracking ───────────────────────────────────────────────────

        builder.Property(t => t.SourceType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(t => t.SourceId)
            .HasMaxLength(300);

        // ── Target tracking ───────────────────────────────────────────────────

        builder.Property(t => t.TargetType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(t => t.TargetId);

        builder.Property(t => t.TargetLabel)
            .HasMaxLength(200);

        // ── Content ───────────────────────────────────────────────────────────

        builder.Property(t => t.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(t => t.Description)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(t => t.WhyThisMatters)
            .HasMaxLength(1000);

        // GuidanceMarkdown is long-form Markdown — no explicit length cap.
        builder.Property(t => t.GuidanceMarkdown);

        builder.Property(t => t.HelpLink)
            .HasMaxLength(500);

        // ── Classification ────────────────────────────────────────────────────

        builder.Property(t => t.Category)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(t => t.Priority)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(10);

        builder.Property(t => t.Phase)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        // ── State ─────────────────────────────────────────────────────────────

        builder.Property(t => t.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(t => t.SortOrder)
            .IsRequired();

        builder.Property(t => t.DueAt)
            .HasColumnType("timestamptz");

        // ── Premium gating ────────────────────────────────────────────────────

        builder.Property(t => t.IsPremium)
            .IsRequired();

        // ── Generation / deduplication ────────────────────────────────────────

        builder.Property(t => t.IsGenerated)
            .IsRequired();

        builder.Property(t => t.GenerationKey)
            .HasMaxLength(400);

        builder.Property(t => t.SupersededByTaskId);

        // ── Timestamps ────────────────────────────────────────────────────────

        builder.Property(t => t.CompletedAt)
            .HasColumnType("timestamptz");

        builder.Property(t => t.SkippedAt)
            .HasColumnType("timestamptz");

        // ── Relationships ─────────────────────────────────────────────────────

        builder.HasOne(t => t.Family)
            .WithMany()
            .HasForeignKey(t => t.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(t => t.SupersededBy)
            .WithMany()
            .HasForeignKey(t => t.SupersededByTaskId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(t => t.Events)
            .WithOne(e => e.Task)
            .HasForeignKey(e => e.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Indexes ───────────────────────────────────────────────────────────

        // Primary lookup: all tasks for a family
        builder.HasIndex(t => t.FamilyId)
            .HasDatabaseName("ix_safety_tasks_family_id");

        // Filter by source type (e.g. show only FreeCheck tasks)
        builder.HasIndex(t => new { t.FamilyId, t.SourceType })
            .HasDatabaseName("ix_safety_tasks_family_source_type");

        // Deduplicate on generation: family + key must be unique when non-null
        builder.HasIndex(t => new { t.FamilyId, t.GenerationKey })
            .IsUnique()
            .HasFilter("\"GenerationKey\" IS NOT NULL")
            .HasDatabaseName("ix_safety_tasks_family_generation_key");

        // SourceId uniqueness per family (used for system-rule reconciliation)
        builder.HasIndex(t => new { t.FamilyId, t.SourceId })
            .HasFilter("\"SourceId\" IS NOT NULL")
            .HasDatabaseName("ix_safety_tasks_family_source_id");

        // Filter by status (e.g. show only Pending tasks)
        builder.HasIndex(t => new { t.FamilyId, t.Status })
            .HasDatabaseName("ix_safety_tasks_family_status");

        // Filter by priority
        builder.HasIndex(t => new { t.FamilyId, t.Priority })
            .HasDatabaseName("ix_safety_tasks_family_priority");

        // Filter by phase
        builder.HasIndex(t => new { t.FamilyId, t.Phase })
            .HasDatabaseName("ix_safety_tasks_family_phase");

        // Background job index: AnnualPlanRefreshService scans across ALL families for
        // overdue recurring tasks. The family-scoped indexes are not helpful for this
        // cross-family query on (SourceType, Phase, Status, DueAt).
        builder.HasIndex(t => new { t.SourceType, t.Phase, t.Status, t.DueAt })
            .HasFilter("\"SupersededByTaskId\" IS NULL AND \"DueAt\" IS NOT NULL")
            .HasDatabaseName("ix_safety_tasks_annual_recurring_due");
    }
}
