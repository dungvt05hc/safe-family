using SafeFamily.Api.Features.Admin.Dtos;

namespace SafeFamily.Api.Features.Admin;

/// <summary>
/// Admin-level operations for inspecting and manually controlling safety task generation.
///
/// These methods are intentionally kept separate from <see cref="IAdminService"/> to
/// honour SRP: this service only knows about task generation concerns.
/// </summary>
public interface IAdminTaskService
{
    /// <summary>
    /// Returns aggregate counts broken down by status and source type for all
    /// safety tasks belonging to <paramref name="familyId"/>.
    ///
    /// Used by admins as a quick health-check — e.g. "has this family had any
    /// tasks generated? are there stuck Pending tasks from old bookings?".
    /// </summary>
    Task<AdminFamilyTaskSummaryDto> GetFamilyTaskSummaryAsync(
        Guid familyId, CancellationToken ct = default);

    /// <summary>
    /// Returns every safety task for the family together with each task's full
    /// <see cref="Domain.Tasks.TaskEvent"/> log, ordered newest-first.
    ///
    /// Intended for debugging generation outcomes: admins can see exactly which
    /// specs fired, what action the engine took (Created / Refreshed / Skipped /
    /// Superseded), and the full status history of each task.
    /// </summary>
    Task<AdminTaskGenerationLogDto> GetGenerationLogAsync(
        Guid familyId, CancellationToken ct = default);

    /// <summary>
    /// Manually triggers a full task regeneration for the family using their
    /// latest assessment. Delegates to
    /// <see cref="ISafetyTaskLifecycleService.RegenerateForAssessmentAsync"/>.
    ///
    /// Returns a <see cref="AdminTaskGenerationResultDto"/> reporting what was
    /// created, refreshed, skipped, or superseded.
    ///
    /// If the family has no assessment yet the call returns a no-op result with
    /// a descriptive message — no tasks are touched.
    /// </summary>
    Task<AdminTaskGenerationResultDto> TriggerRegenerationAsync(
        Guid familyId, Guid adminId, CancellationToken ct = default);
}
