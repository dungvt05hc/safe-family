using SafeFamily.Api.Domain.Accounts;
using SafeFamily.Api.Domain.Assessments;
using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Domain.Devices;
using SafeFamily.Api.Domain.Families;
using SafeFamily.Api.Domain.Incidents;

namespace SafeFamily.Api.Features.Fulfillment;

/// <summary>
/// Carries all pre-loaded domain data needed by package fulfillment handlers.
/// Built once by <see cref="SafeFamily.Api.Features.Bookings.FulfillmentService"/>
/// before dispatching to a handler — avoids redundant database queries inside handlers.
/// </summary>
public sealed record FulfillmentContext(
    Booking Booking,
    Assessment? LatestAssessment,
    IReadOnlyList<FamilyPerson> FamilyPersons,
    Incident? LinkedIncident,
    HashSet<string?> ExistingChecklistSourceIds,
    /// <summary>Active (non-archived) accounts for this family. Used by task generation rules.</summary>
    IReadOnlyList<Account> Accounts,
    /// <summary>Active (non-archived) devices for this family. Used by task generation rules.</summary>
    IReadOnlyList<Device> Devices);
