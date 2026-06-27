using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SafeFamily.Api.Domain.Users;

namespace SafeFamily.Api.Data.Configurations;

public class UserExternalLoginConfiguration : BaseEntityConfiguration<UserExternalLogin>
{
    public override void Configure(EntityTypeBuilder<UserExternalLogin> builder)
    {
        base.Configure(builder);

        builder.ToTable("user_external_logins");

        // ── Provider identity columns ───────────────────────────────────────

        builder.Property(x => x.Provider)
            .IsRequired()
            .HasMaxLength(50);   // "Google", "Apple", "Microsoft", …

        // ProviderSubject holds the "sub" claim — typically 21 digits for Google,
        // but other providers may use longer strings; 256 is a safe upper bound.
        builder.Property(x => x.ProviderSubject)
            .IsRequired()
            .HasMaxLength(256);

        // Email stored at link-time; informational only.
        builder.Property(x => x.ProviderEmail)
            .HasMaxLength(256);

        // ── Unique composite index ──────────────────────────────────────────
        // A given (provider, subject) pair must map to exactly one SafeFamily user.
        // This is the primary integrity constraint that prevents duplicate accounts.
        builder.HasIndex(x => new { x.Provider, x.ProviderSubject })
            .IsUnique();

        // ── Relationship ───────────────────────────────────────────────────
        builder.HasOne(x => x.User)
            .WithMany(u => u.ExternalLogins)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);   // removing a user removes all their linked providers
    }
}
