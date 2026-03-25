using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Common;

namespace SafeFamily.Api.Data.Configurations;

/// <summary>
/// Abstract base configuration for all entities that inherit from <see cref="BaseEntity"/>.
/// Configures the primary key, timestamp columns, and Guid generation strategy.
///
/// Usage: override Configure() in concrete feature configurations and call base.Configure(builder).
/// Example:
///   public class FamilyConfiguration : BaseEntityConfiguration&lt;Family&gt;
///   {
///       public override void Configure(EntityTypeBuilder&lt;Family&gt; builder)
///       {
///           base.Configure(builder);
///           builder.ToTable("families");
///           builder.Property(f => f.Name).IsRequired().HasMaxLength(200);
///       }
///   }
/// </summary>
public abstract class BaseEntityConfiguration<T> : IEntityTypeConfiguration<T>
    where T : BaseEntity
{
    public virtual void Configure(EntityTypeBuilder<T> builder)
    {
        builder.HasKey(e => e.Id);

        // Guids are generated in application code (see BaseEntity.Id initializer),
        // so we tell EF not to generate them in the database.
        builder.Property(e => e.Id)
            .ValueGeneratedNever();

        builder.Property(e => e.CreatedAt)
            .IsRequired()
            .HasColumnType("timestamptz");

        builder.Property(e => e.UpdatedAt)
            .IsRequired()
            .HasColumnType("timestamptz");
    }
}
