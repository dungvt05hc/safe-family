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

        builder.Property(p => p.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(p => p.Code)
            .IsUnique();

        builder.Property(p => p.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(p => p.Price)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(p => p.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(p => p.DurationMinutes)
            .IsRequired();

        builder.Property(p => p.IsActive)
            .IsRequired();

        builder.Property(p => p.IsVisible)
            .IsRequired();

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
                Code = "FREE-CHECK",
                Name = "Free Safety Check",
                Description = "Instantly understand where your family stands on digital safety. Receive a downloadable security summary report highlighting your top gaps and 3 personalised action items — no card required.",
                Price = 0m,
                Currency = "VND",
                DurationMinutes = 0,
                IsActive = true,
                IsVisible = true,
                PriceDisplay = "Free",
                DurationLabel = "Instant access",
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new ServicePackage
            {
                Id = new Guid("22222222-2222-2222-2222-222222222222"),
                Code = "FAMILY-CORE",
                Name = "Family Safety Plan",
                Description = "A comprehensive, personalised PDF safety plan covering every account, device, and family member. Includes a full security audit, a premium interactive checklist, and step-by-step improvement guidance.",
                Price = 2000m,
                Currency = "VND",
                DurationMinutes = 0,
                IsActive = true,
                IsVisible = true,
                PriceDisplay = "2,000 VND",
                DurationLabel = "Ready within 24h",
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new ServicePackage
            {
                Id = new Guid("33333333-3333-3333-3333-333333333333"),
                Code = "INCIDENT-RESP",
                Name = "Incident Recovery Pack",
                Description = "Dealing with a breach, scam, or data leak? Get an expert-authored recovery pack with step-by-step containment actions, a threat checklist, and a follow-up monitoring guide — delivered fast.",
                Price = 149000m,
                Currency = "VND",
                DurationMinutes = 0,
                IsActive = true,
                IsVisible = true,
                PriceDisplay = "149,000 VND",
                DurationLabel = "Priority — within 12h",
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new ServicePackage
            {
                Id = new Guid("44444444-4444-4444-4444-444444444444"),
                Code = "ANNUAL-PLAN",
                Name = "Annual Safety Plan",
                Description = "Year-round digital protection delivered to your account. Includes 4 quarterly safety plan updates, priority incident response with a 24-hour SLA, and a personalised full-family security roadmap.",
                Price = 299000m,
                Currency = "VND",
                DurationMinutes = 365,
                IsActive = true,
                IsVisible = true,
                PriceDisplay = "299,000 VND / year",
                DurationLabel = "12 months access",
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
