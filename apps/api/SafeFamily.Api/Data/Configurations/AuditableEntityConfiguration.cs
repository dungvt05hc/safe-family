using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Common;

namespace SafeFamily.Api.Data.Configurations;

/// <summary>
/// Abstract base configuration for entities that inherit from <see cref="AuditableEntity"/>.
/// Extends <see cref="BaseEntityConfiguration{T}"/> with nullable who-columns.
///
/// Usage: override Configure() in concrete feature configurations and call base.Configure(builder).
/// Example:
///   public class OrderConfiguration : AuditableEntityConfiguration&lt;Order&gt;
///   {
///       public override void Configure(EntityTypeBuilder&lt;Order&gt; builder)
///       {
///           base.Configure(builder);
///           builder.ToTable("orders");
///           builder.Property(o => o.Reference).IsRequired().HasMaxLength(50);
///       }
///   }
/// </summary>
public abstract class AuditableEntityConfiguration<T> : BaseEntityConfiguration<T>
    where T : AuditableEntity
{
    public override void Configure(EntityTypeBuilder<T> builder)
    {
        base.Configure(builder);

        builder.Property(e => e.CreatedById);

        builder.Property(e => e.UpdatedById);
    }
}
