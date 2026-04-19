using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Data.Configurations;
using SafeFamily.Api.Domain.Tasks;

namespace SafeFamily.Api.Data.Configurations;

public class TaskEventConfiguration : BaseEntityConfiguration<TaskEvent>
{
    public override void Configure(EntityTypeBuilder<TaskEvent> builder)
    {
        base.Configure(builder);

        builder.ToTable("task_events");

        builder.Property(e => e.TaskId)
            .IsRequired();

        builder.Property(e => e.EventType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.OldStatus)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.NewStatus)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.Notes)
            .HasMaxLength(1000);

        builder.Property(e => e.CreatedById);

        // ── Relationship (FK + cascade already configured in SafetyTaskConfiguration) ──

        builder.HasOne(e => e.Task)
            .WithMany(t => t.Events)
            .HasForeignKey(e => e.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Indexes ───────────────────────────────────────────────────────────

        // Primary lookup: all events for a task
        builder.HasIndex(e => e.TaskId)
            .HasDatabaseName("ix_task_events_task_id");

        // All events created by a specific user
        builder.HasIndex(e => e.CreatedById)
            .HasFilter("\"CreatedById\" IS NOT NULL")
            .HasDatabaseName("ix_task_events_created_by_id");
    }
}
