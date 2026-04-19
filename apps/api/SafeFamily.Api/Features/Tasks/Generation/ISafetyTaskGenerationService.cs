namespace SafeFamily.Api.Features.Tasks.Generation;

/// <summary>
/// Engine that idempotently generates safety tasks for a family from a set of rule specs.
///
/// <para>
/// <b>Upsert semantics</b><br/>
/// For each <see cref="TaskGenerationSpec"/> the engine applies the following logic:
/// <list type="number">
///   <item>
///     Look up the family's tasks by <see cref="TaskGenerationSpec.GenerationKey"/>.
///     Only tasks where <c>SupersededByTaskId IS NULL</c> are considered "active".
///   </item>
///   <item>
///     <b>No matching task</b> → insert a new task (<c>Created</c>).
///   </item>
///   <item>
///     <b>Active task found, content unchanged</b> → no write needed (<c>Skipped</c>).
///   </item>
///   <item>
///     <b>Active task found, content changed</b> → update title/description/priority/phase/etc.
///     in place and append a <see cref="Domain.Tasks.TaskEvent"/> (<c>Refreshed</c>).
///   </item>
/// </list>
/// Completed or Dismissed tasks are treated as closed: a new task is created if the rule
/// fires again, so families are not blocked from re-encountering a task they already actioned.
/// </para>
///
/// <para>
/// <b>Supersession (explicit regeneration)</b><br/>
/// Callers that need to force a fresh task — e.g. incident escalation or advisor-triggered
/// regeneration — should call <see cref="RegenerateAsync"/>.  This marks the old task
/// <c>Superseded</c> (linking it to the new task via <c>SupersededByTaskId</c>) and creates
/// the replacement, producing a <c>Superseded</c> outcome in the result.
/// </para>
/// </summary>
public interface ISafetyTaskGenerationService
{
    /// <summary>
    /// Idempotently generates tasks for <paramref name="specs"/>.
    ///
    /// Existing active tasks are refreshed if their content has changed; they are
    /// skipped if they are already current.  New tasks are created for specs with
    /// no matching active task.
    ///
    /// Changes are staged via EF Core's change tracker.  Callers must call
    /// <c>SaveChangesAsync</c> (or the outer unit-of-work saves) to persist.
    /// </summary>
    /// <param name="context">Pre-loaded family data required for generation.</param>
    /// <param name="specs">The set of task rules to ensure exist for the family.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>
    /// A <see cref="TaskGenerationResult"/> describing what was created, refreshed,
    /// skipped, or superseded.
    /// </returns>
    Task<TaskGenerationResult> GenerateAsync(
        TaskGenerationContext context,
        IEnumerable<TaskGenerationSpec> specs,
        CancellationToken ct = default);

    /// <summary>
    /// Forces regeneration of any active tasks that match the supplied
    /// <paramref name="generationKeys"/>, even if their content has not changed.
    ///
    /// Each matched active task is:
    /// <list type="number">
    ///   <item>Marked <c>Superseded</c> (Status = Superseded, TaskEvent appended).</item>
    ///   <item>A new replacement task is inserted and linked back via <c>SupersededByTaskId</c>.</item>
    /// </list>
    ///
    /// Use this when a significant context change (e.g. incident escalation, advisor override)
    /// warrants a fresh task even if the underlying rule spec is identical.
    ///
    /// Changes are staged; callers must call <c>SaveChangesAsync</c>.
    /// </summary>
    /// <param name="context">Family context — <c>TriggeredByUserId</c> will be recorded in the event.</param>
    /// <param name="specs">The replacement spec for each key being superseded.</param>
    /// <param name="ct">Cancellation token.</param>
    Task<TaskGenerationResult> RegenerateAsync(
        TaskGenerationContext context,
        IEnumerable<TaskGenerationSpec> specs,
        CancellationToken ct = default);
}
