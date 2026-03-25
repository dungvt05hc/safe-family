using SafeFamily.Api.Domain.Checklists;

namespace SafeFamily.Api.Features.Checklists;

/// <summary>
/// Transient model produced by <see cref="ChecklistGenerationService"/>.
/// Does not map to a database table; it is used to reconcile against
/// persisted <see cref="ChecklistItem"/> rows.
/// </summary>
public record GeneratedChecklistItem(
    string Title,
    string Description,
    ChecklistCategory Category,
    int Priority,         // 1=High, 2=Medium, 3=Low
    ChecklistSourceType SourceType,
    string SourceId);     // Stable deduplication key, e.g. "acc-2fa:{accountId}"
