using System.ComponentModel.DataAnnotations;
using SafeFamily.Api.Domain.Incidents;

namespace SafeFamily.Api.Features.Incidents.Dtos;

public record IncidentResponse(
    Guid Id,
    Guid FamilyId,
    IncidentType Type,
    IncidentSeverity Severity,
    IncidentStatus Status,
    string Summary,
    string? FirstActionPlan,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public class CreateIncidentRequest
{
    [Required]
    public IncidentType Type { get; set; }

    [Required]
    public IncidentSeverity Severity { get; set; }

    [Required]
    [MaxLength(500)]
    public string Summary { get; set; } = string.Empty;
}

public class UpdateIncidentStatusRequest
{
    [Required]
    public IncidentStatus Status { get; set; }
}
