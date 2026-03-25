using SafeFamily.Api.Domain.Common;

namespace SafeFamily.Api.Domain.Families;

/// <summary>
/// Aggregate root for a family unit. Inherits AuditableEntity so we can
/// track who created and last modified the family record.
/// </summary>
public class Family : AuditableEntity
{
    /// <summary>Human-readable name shown in the UI (e.g. "The Smiths").</summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>ISO 3166-1 alpha-2 country code (e.g. "US", "BR").</summary>
    public string CountryCode { get; set; } = string.Empty;

    /// <summary>IANA timezone identifier (e.g. "America/New_York").</summary>
    public string Timezone { get; set; } = string.Empty;

    public ICollection<FamilyMember> Members { get; set; } = new List<FamilyMember>();
}
