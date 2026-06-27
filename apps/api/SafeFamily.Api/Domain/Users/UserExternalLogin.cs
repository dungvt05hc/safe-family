using SafeFamily.Api.Domain.Common;

namespace SafeFamily.Api.Domain.Users;

/// <summary>
/// Maps a SafeFamily <see cref="User"/> to an external identity provider account.
///
/// Design rationale
/// ────────────────
/// Rather than adding per-provider columns to the <see cref="User"/> table,
/// each provider → user binding is a separate row here.  Adding a new provider
/// (Apple, Microsoft, …) requires no schema change on the users table — just a
/// new row with a different <see cref="Provider"/> value.
///
/// The natural unique key is (<see cref="Provider"/>, <see cref="ProviderSubject"/>)
/// which maps directly to the "iss" + "sub" claims of an OIDC token.
///
/// Rows are append-only: if a user unlinks a provider the row is deleted,
/// not updated.  <see cref="BaseEntity.UpdatedAt"/> is maintained by convention
/// but carries no semantic meaning for this entity.
/// </summary>
public class UserExternalLogin : BaseEntity
{
    /// <summary>
    /// FK to the SafeFamily user who owns this external identity.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Canonical provider name, e.g. "Google", "Apple", "Microsoft".
    /// Stored in PascalCase; always compared case-insensitively.
    /// </summary>
    public string Provider { get; set; } = string.Empty;

    /// <summary>
    /// The external provider's stable, unique identifier for this account —
    /// the "sub" claim in OIDC / Google ID tokens.
    /// Never changes for the lifetime of the external account.
    /// </summary>
    public string ProviderSubject { get; set; } = string.Empty;

    /// <summary>
    /// The email address returned by the provider at the time of linking.
    /// Stored for audit / debugging only; do not use as an auth key because
    /// some providers allow users to change their email.
    /// </summary>
    public string? ProviderEmail { get; set; }

    // ── Navigation ─────────────────────────────────────────────────────────

    /// <summary>The SafeFamily user this external login belongs to.</summary>
    public User User { get; set; } = null!;
}
