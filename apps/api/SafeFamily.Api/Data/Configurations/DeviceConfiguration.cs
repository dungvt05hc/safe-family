using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Data.Configurations;
using SafeFamily.Api.Domain.Devices;

namespace SafeFamily.Api.Data.Configurations;

public class DeviceConfiguration : AuditableEntityConfiguration<Device>
{
    public override void Configure(EntityTypeBuilder<Device> builder)
    {
        base.Configure(builder);

        builder.ToTable("devices");

        builder.Property(d => d.DeviceType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(d => d.Brand)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(d => d.Model)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(d => d.OsName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(d => d.OsVersion)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(d => d.SupportStatus)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(40);

        builder.Property(d => d.ScreenLockEnabled).IsRequired();
        builder.Property(d => d.BiometricEnabled).IsRequired();
        builder.Property(d => d.BackupEnabled).IsRequired();
        builder.Property(d => d.FindMyDeviceEnabled).IsRequired();

        builder.Property(d => d.Notes)
            .HasMaxLength(1000);

        builder.HasOne(d => d.Family)
            .WithMany()
            .HasForeignKey(d => d.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(d => d.Member)
            .WithMany()
            .HasForeignKey(d => d.MemberId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
