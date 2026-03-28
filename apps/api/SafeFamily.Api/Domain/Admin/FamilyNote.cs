using SafeFamily.Api.Domain.Common;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Domain.Admin;

/// <summary>
/// An internal admin note attached to a customer family.
/// Notes are append-only — never updated or deleted through the normal API.
/// Visible only to admin staff; never exposed to family users.
/// </summary>
public class FamilyNote : BaseEntity
{
    public Guid FamilyId { get; set; }

    /// <summary>The note body. Max 2000 characters.</summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>Admin user who authored the note.</summary>
    public Guid AuthorId { get; set; }

    /// <summary>Denormalised admin email — shown in the UI without a JOIN.</summary>
    public string AuthorEmail { get; set; } = string.Empty;

    // ── Navigation ─────────────────────────────────────────────────────────────
    public Family Family { get; set; } = null!;
}
