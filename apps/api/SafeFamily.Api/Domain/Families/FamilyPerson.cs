using SafeFamily.Api.Domain.Common;

namespace SafeFamily.Api.Domain.Families;

/// <summary>
/// Represents a person profile in a family unit (e.g. a child, elderly parent).
/// Distinct from <see cref="FamilyMember"/>, which links platform user accounts to families.
/// Supports soft-archiving via <see cref="ArchivedAt"/>.
/// </summary>
public class FamilyPerson : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>Free-text relationship label (e.g. "Son", "Grandmother").</summary>
    public string Relationship { get; set; } = string.Empty;

    public AgeGroup AgeGroup { get; set; }

    /// <summary>Primary digital ecosystem (e.g. "Apple", "Google", "Windows").</summary>
    public string PrimaryEcosystem { get; set; } = string.Empty;

    public bool IsPrimaryContact { get; set; }

    /// <summary>Non-null when the record has been soft-archived.</summary>
    public DateTimeOffset? ArchivedAt { get; set; }

    public Family Family { get; set; } = null!;
}
