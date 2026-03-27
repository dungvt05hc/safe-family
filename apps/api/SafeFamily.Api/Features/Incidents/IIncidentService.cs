using SafeFamily.Api.Features.Incidents.Dtos;

namespace SafeFamily.Api.Features.Incidents;

public interface IIncidentService
{
    Task<IReadOnlyList<IncidentResponse>> GetIncidentsAsync(Guid userId, CancellationToken ct = default);
    Task<IncidentResponse?> GetIncidentByIdAsync(Guid userId, Guid id, CancellationToken ct = default);
    Task<IncidentResponse> CreateIncidentAsync(Guid userId, CreateIncidentRequest request, CancellationToken ct = default);
    Task<IncidentResponse?> UpdateIncidentStatusAsync(Guid userId, Guid id, UpdateIncidentStatusRequest request, CancellationToken ct = default);
}
