using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Settings;

namespace SafeFamily.Api.Data.Configurations;

public class UserSettingsConfiguration : BaseEntityConfiguration<UserSettings>
{
    public override void Configure(EntityTypeBuilder<UserSettings> builder)
    {
        base.Configure(builder);

        builder.ToTable("user_settings");

        builder.Property(s => s.EmailNotificationsEnabled)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(s => s.BookingUpdatesEnabled)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(s => s.IncidentAlertsEnabled)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(s => s.ReminderNotificationsEnabled)
            .IsRequired()
            .HasDefaultValue(true);

        builder.HasOne(s => s.User)
            .WithOne()
            .HasForeignKey<UserSettings>(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(s => s.UserId)
            .IsUnique();
    }
}
