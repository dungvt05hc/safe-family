using System.ComponentModel.DataAnnotations;
using SafeFamily.Api.Domain.Bookings;

namespace SafeFamily.Api.Features.Bookings.Dtos;

public record ServicePackageResponse(
    Guid Id,
    string Name,
    string Description,
    string PriceDisplay,
    string DurationLabel);

/// <summary>Full booking detail returned to the family user.</summary>
public record BookingResponse(
    Guid Id,
    Guid FamilyId,
    Guid PackageId,
    // ── Package snapshot ────────────────────────────────────────────────────
    string PackageName,
    string PackageCode,
    decimal PackagePrice,
    string PackageCurrency,
    int PackageDurationMinutes,
    // ── Scheduling ──────────────────────────────────────────────────────────
    DateTimeOffset PreferredStartAt,
    DateTimeOffset? ScheduledStartAt,
    DateTimeOffset? ScheduledEndAt,
    // ── Channel & source ────────────────────────────────────────────────────
    BookingChannel Channel,
    BookingSource Source,
    Guid? SourceIncidentId,
    Guid? SourceAssessmentId,
    // ── Notes & status ──────────────────────────────────────────────────────
    string? Notes,
    BookingStatus Status,
    PaymentStatus PaymentStatus,
    DateTimeOffset? ExpiresAt,
    // ── Admin ────────────────────────────────────────────────────────────────
    Guid? AssignedAdminId,
    string? AssignedAdminEmail,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public record BookingSummaryResponse(
    int TotalBookings,
    int UpcomingBookings,
    int AwaitingConfirmation,
    IReadOnlyList<BookingResponse> RecentBookings);

/// <summary>Summary view of a single payment order associated with a booking.</summary>
public record PaymentOrderResponse(
    Guid Id,
    Guid BookingId,
    decimal Amount,
    string Currency,
    PaymentStatus Status,
    string? GatewayProvider,
    string? GatewayOrderId,
    string? PaymentUrl,
    string? QrCodeUrl,
    DateTimeOffset? PaidAt,
    DateTimeOffset? ExpiresAt,
    DateTimeOffset? RefundedAt,
    decimal? RefundedAmount,
    DateTimeOffset CreatedAt);

/// <summary>A single event log entry from the booking's audit trail.</summary>
public record BookingEventResponse(
    Guid Id,
    string EventType,
    string? FromValue,
    string? ToValue,
    string? Description,
    Guid? ActorId,
    string? ActorEmail,
    DateTimeOffset CreatedAt);

// ── Requests ─────────────────────────────────────────────────────────────────

/// <summary>
/// Creates a booking in <see cref="BookingStatus.Draft"/> state.
/// Call POST /api/bookings/{id}/submit to advance to Submitted and trigger payment.
/// </summary>
public class CreateBookingRequest
{
    [Required]
    public Guid PackageId { get; set; }

    [Required]
    public DateTimeOffset PreferredStartAt { get; set; }

    [Required]
    public BookingChannel Channel { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    /// <summary>How this booking originated. Defaults to Direct.</summary>
    public BookingSource Source { get; set; } = BookingSource.Direct;

    /// <summary>
    /// Required when Source is <see cref="BookingSource.IncidentFollowUp"/>.
    /// Must belong to the same family as the requesting user.
    /// </summary>
    public Guid? SourceIncidentId { get; set; }

    /// <summary>
    /// Required when Source is <see cref="BookingSource.AssessmentFollowUp"/>.
    /// Must belong to the same family as the requesting user.
    /// </summary>
    public Guid? SourceAssessmentId { get; set; }
}

