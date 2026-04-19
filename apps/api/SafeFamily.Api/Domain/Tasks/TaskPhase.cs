namespace SafeFamily.Api.Domain.Tasks;

/// <summary>
/// Describes the recommended completion window for a safety task.
/// Used to organise tasks into actionable time-based groups in the UI.
/// Stored as a string for readability and migration safety.
/// </summary>
public enum TaskPhase
{
    /// <summary>Act immediately — within the same day.</summary>
    Immediate  = 0,

    /// <summary>Complete within the next 7 days.</summary>
    Next7Days  = 1,

    /// <summary>Complete within the next 30 days.</summary>
    Next30Days = 2,

    /// <summary>Ongoing or recurring habit with no fixed deadline.</summary>
    Ongoing    = 3,

    /// <summary>
    /// Scheduled recurring task — repeats on a fixed cadence (e.g. quarterly or annually).
    /// <see cref="SafetyTask.DueAt"/> signals the next completion deadline.
    /// On each cycle, the engine calls <c>RegenerateAsync</c> to supersede the completed
    /// task and emit a fresh one with an updated <c>DueAt</c>.
    /// </summary>
    Recurring  = 4,
}
