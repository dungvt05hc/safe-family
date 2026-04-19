using SafeFamily.Api.Features.Tasks.Dtos;

namespace SafeFamily.Api.Features.Tasks;

public interface ISafetyTaskService
{
    /// <summary>
    /// Returns a single safety task by ID, scoped to the authenticated user's family.
    /// Returns null (404) if the task does not exist or belongs to a different family.
    /// Throws <see cref="Common.Exceptions.EntitlementRequiredException"/> (402) if the task
    /// exists but the family lacks the required product entitlement.
    /// </summary>
    Task<SafetyTaskDto?> GetTaskByIdAsync(Guid userId, Guid taskId, CancellationToken ct = default);

    /// <summary>
    /// Returns the family's safety task list with optional filtering.
    /// Tasks are filtered by source-type product entitlement:
    /// FamilySafetyPlan → FamilySafetyPlanAccess, IncidentRecoveryPack → IncidentRecoveryPackAccess,
    /// AnnualPlan → AnnualPlanSubscription, IsPremium flag → PremiumTasksAccess.
    /// </summary>
    Task<IReadOnlyList<SafetyTaskDto>> GetTasksAsync(
        Guid userId, SafetyTaskQueryParams query, CancellationToken ct = default);

    /// <summary>
    /// Returns aggregate counts for the family's safety tasks.
    /// Counts are scoped to tasks the family can access per their current entitlements.
    /// </summary>
    Task<SafetyTaskSummaryDto> GetSummaryAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Updates the status of a single safety task and appends a TaskEvent audit record.
    /// Throws <see cref="Common.Exceptions.EntitlementRequiredException"/> (402) if the family
    /// lacks the required product entitlement to access the task.
    /// </summary>
    Task<SafetyTaskDto> UpdateStatusAsync(
        Guid userId, Guid taskId, UpdateSafetyTaskStatusRequest request,
        CancellationToken ct = default);
}
