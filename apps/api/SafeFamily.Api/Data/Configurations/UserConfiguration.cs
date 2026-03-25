using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Users;

namespace SafeFamily.Api.Data.Configurations;

public class UserConfiguration : BaseEntityConfiguration<User>
{
    public override void Configure(EntityTypeBuilder<User> builder)
    {
        base.Configure(builder);

        builder.ToTable("users");

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(256);

        // Enforce uniqueness at the database level.
        // AppDbContext normalises email to lowercase before saving.
        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.Property(u => u.DisplayName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(u => u.Phone)
            .HasMaxLength(30);

        // PasswordHash is a variable-length string produced by PasswordHasher<T>;
        // typical length is ~84 chars but we leave it uncapped for forward compatibility.
        builder.Property(u => u.PasswordHash)
            .IsRequired();

        builder.Property(u => u.Role)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(Domain.Users.UserRole.User);
    }
}
