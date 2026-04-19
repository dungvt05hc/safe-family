using SafeFamily.Api.Features.Tasks.Generation;

namespace SafeFamily.Api.Features.Fulfillment;

/// <summary>
/// Handles fulfillment for a specific service package by adding the appropriate
/// domain entities, reports, checklist items, and safety tasks to the EF change tracker.
///
/// Implementations MUST NOT call <c>SaveChangesAsync</c> — the orchestrating
/// <see cref="SafeFamily.Api.Features.Bookings.FulfillmentService"/> handles persistence
/// so that all entities produced by the handler are saved in a single transaction.
/// </summary>
public interface IPackageFulfillmentHandler
{
    /// <summary>
    /// Stages all fulfillment entities for this package in the EF change tracker.
    /// </summary>
    /// <returns>
    /// A <see cref="TaskGenerationResult"/> summarising tasks created/refreshed/skipped,
    /// or <c>null</c> when the package produces no safety tasks.
    /// </returns>
    Task<TaskGenerationResult?> PrepareAsync(FulfillmentContext context, CancellationToken ct = default);
}
