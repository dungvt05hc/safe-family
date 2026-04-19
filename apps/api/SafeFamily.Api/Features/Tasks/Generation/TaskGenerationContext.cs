using SafeFamily.Api.Domain.Accounts;
using SafeFamily.Api.Domain.Devices;
using SafeFamily.Api.Domain.Families;

namespace SafeFamily.Api.Features.Tasks.Generation;

/// <summary>
/// Carries all pre-loaded domain data required by the generation engine to build
/// <see cref="TaskGenerationSpec"/> instances without issuing per-spec database queries.
///
/// Callers (fulfillment handlers, background reconciliation jobs, etc.) are responsible
/// for loading the relevant slices of data and passing them in a single context object.
/// The generation engine treats this object as read-only input.
///
/// Unneeded collections can be left empty — the source-specific helpers in each handler
/// only access the collections they need.
/// </summary>
public sealed class TaskGenerationContext
{
    // ── Mandatory ──────────────────────────────────────────────────────────────

    /// <summary>The family for which tasks are being generated.</summary>
    public required Guid FamilyId { get; init; }

    /// <summary>
    /// The user who triggered generation (e.g. the advisor who initiated a booking
    /// fulfillment, or null for fully automated system-rule reconciliation).
    /// Recorded as <c>CreatedById</c> on resulting <see cref="Domain.Tasks.TaskEvent"/> rows.
    /// </summary>
    public Guid? TriggeredByUserId { get; init; }

    // ── Source identifiers ─────────────────────────────────────────────────────

    /// <summary>Booking ID when generation is triggered by a booking fulfillment.</summary>
    public Guid? BookingId { get; init; }

    /// <summary>Incident ID when generation is triggered by an incident recovery pack.</summary>
    public Guid? IncidentId { get; init; }

    // ── Pre-loaded domain data (optional — leave empty if not applicable) ──────

    /// <summary>
    /// All digital accounts belonging to the family.
    /// Used by system-rule generation (e.g. "enable 2FA on {account}").
    /// </summary>
    public IReadOnlyList<Account> Accounts { get; init; } = [];

    /// <summary>
    /// All devices belonging to the family.
    /// Used by system-rule generation (e.g. "enable backup on {device}").
    /// </summary>
    public IReadOnlyList<Device> Devices { get; init; } = [];

    /// <summary>
    /// Family members.
    /// Used when generating member-specific tasks (e.g. "set up child account safety").
    /// </summary>
    public IReadOnlyList<FamilyPerson> FamilyPersons { get; init; } = [];

    // ── Deduplication set (populated by the engine, exposed for diagnostics) ───

    /// <summary>
    /// Generation keys for tasks that already exist as active (non-superseded) tasks
    /// for this family.  Populated by the engine before processing specs — exposed
    /// here so callers can inspect which tasks were skipped vs created.
    ///
    /// Do NOT populate this manually: the engine resolves existing keys from the database.
    /// </summary>
    internal HashSet<string> ExistingActiveGenerationKeys { get; } = new(StringComparer.Ordinal);
}
