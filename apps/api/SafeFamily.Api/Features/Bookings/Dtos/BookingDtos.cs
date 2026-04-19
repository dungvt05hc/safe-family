using System.ComponentModel.DataAnnotations;
using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Domain.Reports;

namespace SafeFamily.Api.Features.Bookings.Dtos;

public record ServicePackageResponse(
    Guid Id,
    string Code,
    string Name,
    string Description,
    string PriceDisplay,
    string DurationLabel);

/// <summary>Slim report summary shown to the family on their booking detail.</summary>
public record BookingReportInfo(
    Guid ReportId,
    ReportType ReportType,
    string Title,
    string Description,
    string? FileUrl,
    DateTimeOffset GeneratedAt);

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
    DateTimeOffset? ConfirmedStartAt,
    DateTimeOffset? ConfirmedEndAt,
    // ── Channel & source ────────────────────────────────────────────────────
    BookingChannel Channel,
    BookingSource Source,
    Guid? SourceIncidentId,
    Guid? SourceAssessmentId,
    // ── Notes & status ──────────────────────────────────────────────────────
    string? CustomerNotes,
    BookingStatus Status,
    PaymentStatus PaymentStatus,
    DateTimeOffset? ExpiresAt,
    DateTimeOffset? CompletedAt,
    // ── Admin ────────────────────────────────────────────────────────────────
    Guid? AssignedAdminUserId,
    string? AssignedAdminEmail,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    // ── Linked report (null when none attached) ──────────────────────────────
    BookingReportInfo? PrimaryReport,
    // ── Digital-product fields (null for legacy bookings) ────────────────────
    string? HelpTopic,
    BookingUrgency? Urgency,
    string? AffectedTarget,
    string? AffectedMember,
    string? DesiredOutcome,
    Guid? AffectedAccountId,
    Guid? AffectedDeviceId,
    // ── Fulfillment ──────────────────────────────────────────────────────────
    DeliveryStatus DeliveryStatus,
    DateTimeOffset? DeliveredAt);

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
    PaymentType PaymentType,
    string? FailureReason,
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

    /// <summary>What the family needs help with. Required for new bookings.</summary>
    [Required, MaxLength(200)]
    public string HelpTopic { get; set; } = string.Empty;

    /// <summary>How urgently the family needs assistance. Defaults to Routine.</summary>
    public BookingUrgency Urgency { get; set; } = BookingUrgency.Routine;

    /// <summary>Specific account, device, or platform affected (optional).</summary>
    [MaxLength(200)]
    public string? AffectedTarget { get; set; }

    /// <summary>Which family member is primarily affected (optional).</summary>
    [MaxLength(100)]
    public string? AffectedMember { get; set; }

    /// <summary>The outcome the family is hoping to achieve (optional).</summary>
    [MaxLength(500)]
    public string? DesiredOutcome { get; set; }

    /// <summary>FK to a specific Account the issue relates to (optional).</summary>
    public Guid? AffectedAccountId { get; set; }

    /// <summary>FK to a specific Device the issue relates to (optional).</summary>
    public Guid? AffectedDeviceId { get; set; }

    [MaxLength(1000)]
    public string? CustomerNotes { get; set; }

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

    /// <summary>
    /// Optional preferred start time. Defaults to UtcNow when omitted.
    /// Kept for admin-created bookings and backward compatibility.
    /// </summary>
    public DateTimeOffset? PreferredStartAt { get; set; }

    /// <summary>
    /// Delivery channel. Defaults to Online when omitted.
    /// Kept for admin-created bookings and backward compatibility.
    /// </summary>
    public BookingChannel? Channel { get; set; }
}

