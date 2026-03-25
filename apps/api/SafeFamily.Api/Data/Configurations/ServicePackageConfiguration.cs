using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Bookings;

namespace SafeFamily.Api.Data.Configurations;

public class ServicePackageConfiguration : BaseEntityConfiguration<ServicePackage>
{
    public override void Configure(EntityTypeBuilder<ServicePackage> builder)
    {
        base.Configure(builder);

        builder.ToTable("service_packages");

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(p => p.PriceDisplay)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.DurationLabel)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasData(
            new ServicePackage
            {
                Id = new Guid("11111111-1111-1111-1111-111111111111"),
                Name = "Free Safety Check",
                Description = "A complimentary 30-minute session to review your family's current digital safety posture and identify quick wins.",
                PriceDisplay = "Free",
                DurationLabel = "30 min",
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new ServicePackage
            {
                Id = new Guid("22222222-2222-2222-2222-222222222222"),
                Name = "Family Safety Session",
                Description = "An in-depth 60-minute consultation covering password hygiene, device security, phishing awareness, and safe browsing for all family members.",
                PriceDisplay = "$99 / session",
                DurationLabel = "60 min",
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new ServicePackage
            {
                Id = new Guid("33333333-3333-3333-3333-333333333333"),
                Name = "Incident Response",
                Description = "A 90-minute guided incident response session to contain and remediate an active security incident affecting your family.",
                PriceDisplay = "$149 / session",
                DurationLabel = "90 min",
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new ServicePackage
            {
                Id = new Guid("44444444-4444-4444-4444-444444444444"),
                Name = "Annual Safety Plan",
                Description = "Year-round protection planning: quarterly check-ins, priority incident response, and a personalised family security roadmap.",
                PriceDisplay = "$299 / year",
                DurationLabel = "Ongoing",
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
