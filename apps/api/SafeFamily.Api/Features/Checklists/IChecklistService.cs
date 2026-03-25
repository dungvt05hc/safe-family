using SafeFamily.Api.Features.Checklists.Dtos;

namespace SafeFamily.Api.Features.Checklists;

public interface IChecklistService
{
    /// <summary>
    /// Returns the reconciled checklist for the user's family, with optional filtering.
    /// Generates new items from current account/device state, prunes resolved
    /// Pending items, and persists the result before returning.
    /// </summary>
    Task<IReadOnlyList<ChecklistItemDto>> GetChecklistAsync(
        Guid userId, ChecklistQueryParams query, CancellationToken ct = default);

    /// <summary>Returns aggregate counts for the user's family checklist.</summary>
    Task<ChecklistSummaryDto> GetSummaryAsync(Guid userId, CancellationToken ct = default);

    /// <summary>Updates the status of a single checklist item.</summary>
    Task<ChecklistItemDto> UpdateStatusAsync(
        Guid userId, Guid itemId, UpdateChecklistStatusRequest request, CancellationToken ct = default);
}
