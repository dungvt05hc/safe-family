using SafeFamily.Api.Features.Dashboard.Dtos;

namespace SafeFamily.Api.Features.Dashboard;

public interface IDashboardService
{
    Task<DashboardResponse> GetDashboardAsync(Guid userId, CancellationToken ct = default);
}
