using SafeFamily.Api.Domain.Accounts;
using SafeFamily.Api.Domain.Assessments;
using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Domain.Checklists;
using SafeFamily.Api.Domain.Devices;
using SafeFamily.Api.Domain.Families;
using SafeFamily.Api.Domain.Incidents;
using SafeFamily.Api.Domain.Reports;
using SafeFamily.Api.Domain.Users;
using System.ComponentModel.DataAnnotations;

namespace SafeFamily.Api.Features.Admin.Dtos;

// ── Dashboard ────────────────────────────────────────────────────────────────

/// <summary>Summary row for a single booking shown on the admin dashboard.</summary>
public record DashboardBookingRow(
    Guid Id,
    string FamilyName,
    string PackageName,
    BookingStatus Status,
    PaymentStatus PaymentStatus,
    DateTimeOffset PreferredStartAt,
    DateTimeOffset CreatedAt);

/// <summary>Summary row for a single incident shown on the admin dashboard.</summary>
public record DashboardIncidentRow(
    Guid Id,
    string FamilyName,
    IncidentType Type,
    IncidentSeverity Severity,
    IncidentStatus Status,
    string Summary,
    DateTimeOffset CreatedAt);

public record AdminDashboardResponse(
    // ── Counts ──────────────────────────────────────────────────────────────
    int TotalUsers,
    int TotalFamilies,
    int TotalMembers,
    int TotalBookings,
    int TotalIncidents,
    int TotalReports,
    int OpenIncidents,
    int PendingBookings,
    int HighRiskFamilies,
    // ── Recent lists ────────────────────────────────────────────────────────
    IReadOnlyList<DashboardBookingRow> RecentBookings,
    IReadOnlyList<DashboardIncidentRow> RecentIncidents,
    IReadOnlyList<AuditLogEntryResponse> RecentAuditLogs);

// ── Customers / Families ─────────────────────────────────────────────────────

/// <summary>
/// Operational summary row for a single family, returned by
/// GET /api/admin/customers with server-side search, filtering and pagination.
/// </summary>
public record AdminCustomerRow(
    Guid FamilyId,
    string FamilyName,
    string CountryCode,
    /// <summary>Email of the family Owner member (nullable if no owner yet).</summary>
    string? OwnerEmail,
    string? OwnerDisplayName,
    string? OwnerPhone,
    int MemberCount,
    /// <summary>Risk level from the most recent assessment; null = no assessment taken.</summary>
    RiskLevel? LatestRiskLevel,
    int OpenIncidentCount,
    int PendingBookingCount,
    /// <summary>Package name from the most recent booking; null = no bookings.</summary>
    string? LatestPlanType,
    DateTimeOffset CreatedAt);

public record AdminCustomerListResponse(
    IReadOnlyList<AdminCustomerRow> Items,
    int Total,
    int Page,
    int PageSize);

// ── Bookings ─────────────────────────────────────────────────────────────────

/// <summary>
/// Combined filter for common admin booking workflow stages.
/// Each value maps to a predefined combination of BookingStatus + PaymentStatus predicates.
/// </summary>
public enum BookingQuickFilter
{
    PendingPayment,       // Status == Submitted AND PaymentStatus is Unpaid or Pending
    PaidNotConfirmed,     // Status == Paid (awaiting admin confirmation)
    Confirmed,            // Status == Confirmed (awaiting time-slot)
    Scheduled,            // Status == Scheduled
    InProgress,           // Status == InProgress
    Completed,            // Status == Completed
    Cancelled,            // Status == Cancelled
    Expired,              // Status == Expired
}

/// <summary>Summary of the most recent payment order on a booking (for list rows).</summary>
public record AdminBookingPaymentSummary(
    Guid OrderId,
    decimal Amount,
    string Currency,
    PaymentStatus Status,
    string? GatewayProvider,
    DateTimeOffset? PaidAt,
    DateTimeOffset? ExpiresAt,
    DateTimeOffset CreatedAt);

/// <summary>Full payment order detail shown in the booking detail view.</summary>
public record AdminBookingPaymentOrderInfo(
    Guid OrderId,
    decimal Amount,
    string Currency,
    PaymentStatus Status,
    string? GatewayProvider,
    string? GatewayOrderId,
    string? GatewayTransactionId,
    string? PaymentUrl,
    string? QrCodeUrl,
    DateTimeOffset? PaidAt,
    DateTimeOffset? ExpiresAt,
    DateTimeOffset? FailedAt,
    DateTimeOffset? RefundedAt,
    decimal? RefundedAmount,
    DateTimeOffset CreatedAt);

/// <summary>Audit event entry shown in the booking detail view.</summary>
public record AdminBookingEventInfo(
    Guid EventId,
    string EventType,
    string? FromValue,
    string? ToValue,
    string? Description,
    Guid? ActorId,
    string? ActorEmail,
    DateTimeOffset CreatedAt);

/// <summary>
/// Booking row returned by the paged list and status-mutation endpoints.
/// Includes snapshot, scheduling, source, payment summary, and assigned-admin
/// fields so the table requires no secondary lookup.
/// </summary>
public record AdminBookingResponse(
    Guid Id,
    Guid FamilyId,
    string FamilyName,
    Guid PackageId,
    string PackageName,
    // Snapshot — terms agreed at booking time
    string SnapshotPackageCode,
    decimal SnapshotPrice,
    string SnapshotCurrency,
    int SnapshotDurationMinutes,
    // Scheduling
    DateTimeOffset PreferredStartAt,
    DateTimeOffset? ScheduledStartAt,
    DateTimeOffset? ScheduledEndAt,
    // Channel & origin
    BookingChannel Channel,
    BookingSource Source,
    Guid? SourceIncidentId,
    Guid? SourceAssessmentId,
    // Notes & status
    string? Notes,
    BookingStatus Status,
    PaymentStatus PaymentStatus,
    DateTimeOffset? ExpiresAt,
    // Assignment
    Guid? AssignedAdminId,
    string? AssignedAdminEmail,
    // Payment summary (latest order — null if no order created yet)
    AdminBookingPaymentSummary? LatestPayment,
    // Timestamps
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

/// <summary>Paged list wrapper returned by GET /api/admin/bookings.</summary>
public record AdminBookingListResponse(
    IReadOnlyList<AdminBookingResponse> Items,
    int Total,
    int Page,
    int PageSize);

/// <summary>Internal admin note on a booking.</summary>
public record AdminBookingNoteInfo(
    Guid NoteId,
    string Content,
    Guid AuthorId,
    string AuthorEmail,
    DateTimeOffset CreatedAt);

/// <summary>
/// Full booking detail returned by GET /api/admin/bookings/{id}.
/// Extends the list row with full payment orders, audit events, resolved source
/// entity summaries, and internal admin notes.
/// </summary>
public record AdminBookingDetailResponse(
    Guid Id,
    Guid FamilyId,
    string FamilyName,
    Guid PackageId,
    string PackageName,
    // Snapshot
    string SnapshotPackageCode,
    decimal SnapshotPrice,
    string SnapshotCurrency,
    int SnapshotDurationMinutes,
    // Scheduling
    DateTimeOffset PreferredStartAt,
    DateTimeOffset? ScheduledStartAt,
    DateTimeOffset? ScheduledEndAt,
    // Channel & origin
    BookingChannel Channel,
    BookingSource Source,
    Guid? SourceIncidentId,
    Guid? SourceAssessmentId,
    // Resolved source names (null when source IDs are null)
    string? SourceIncidentSummary,
    DateTimeOffset? SourceAssessmentDate,
    // Notes & status
    string? Notes,
    BookingStatus Status,
    PaymentStatus PaymentStatus,
    DateTimeOffset? ExpiresAt,
    // Assignment
    Guid? AssignedAdminId,
    string? AssignedAdminEmail,
    // Payment summary (latest order)
    AdminBookingPaymentSummary? LatestPayment,
    // Timestamps
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    // Collections
    IReadOnlyList<AdminBookingPaymentOrderInfo> PaymentOrders,
    IReadOnlyList<AdminBookingEventInfo> Events,
    IReadOnlyList<AdminBookingNoteInfo> BookingNotes);

/// <summary>Admin-only: update the payment status of a booking.</summary>
public class UpdateBookingPaymentStatusRequest
{
    public required PaymentStatus Status { get; set; }
}

/// <summary>Admin-only: update the lifecycle status of a booking (confirm, cancel, complete).</summary>
public class UpdateAdminBookingStatusRequest
{
    public required BookingStatus Status { get; set; }
}

/// <summary>Request body for PATCH /api/admin/bookings/{id}/assign.</summary>
public class AssignBookingRequest
{
    public Guid? AssignedAdminId { get; set; }

    [MaxLength(200)]
    public string? AssignedAdminEmail { get; set; }
}

/// <summary>Request body for POST /api/admin/bookings/{id}/notes.</summary>
public class AddBookingNoteRequest
{
    [Required, MinLength(1), MaxLength(2000)]
    public required string Content { get; set; }
}

// ── Incidents ────────────────────────────────────────────────────────────────

/// <summary>
/// Slim incident row returned by the paged list and status-mutation endpoints.
/// Includes denormalised related-entity ids so the table requires no secondary
/// lookup.
/// </summary>
public record AdminIncidentResponse(
    Guid Id,
    Guid FamilyId,
    string FamilyName,
    IncidentType Type,
    IncidentSeverity Severity,
    IncidentStatus Status,
    string Summary,
    string? FirstActionPlan,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    /// <summary>Id of the first report linked to this incident, if any.</summary>
    Guid? RelatedReportId,
    /// <summary>Booking id from the related report, if any.</summary>
    Guid? RelatedBookingId);

/// <summary>Paged list wrapper returned by GET /api/admin/incidents.</summary>
public record AdminIncidentListResponse(
    IReadOnlyList<AdminIncidentResponse> Items,
    int Total,
    int Page,
    int PageSize);

/// <summary>Internal admin note on an incident.</summary>
public record AdminIncidentNoteInfo(
    Guid NoteId,
    string Content,
    Guid AuthorId,
    string AuthorEmail,
    DateTimeOffset CreatedAt);

/// <summary>Slim report linked to an incident, shown in the detail panel.</summary>
public record AdminIncidentRelatedReport(
    Guid ReportId,
    ReportType ReportType,
    string Title,
    Guid? BookingId,
    DateTimeOffset GeneratedAt);

/// <summary>
/// Full incident detail returned by GET /api/admin/incidents/{id}.
/// Extends the slim row with internal admin notes and related reports.
/// </summary>
public record AdminIncidentDetailResponse(
    Guid Id,
    Guid FamilyId,
    string FamilyName,
    IncidentType Type,
    IncidentSeverity Severity,
    IncidentStatus Status,
    string Summary,
    string? FirstActionPlan,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    Guid? RelatedReportId,
    Guid? RelatedBookingId,
    IReadOnlyList<AdminIncidentNoteInfo> Notes,
    IReadOnlyList<AdminIncidentRelatedReport> RelatedReports);

/// <summary>Admin-only: update the workflow status of an incident.</summary>
public class UpdateIncidentStatusRequest
{
    public required IncidentStatus Status { get; set; }
}

/// <summary>Request body for POST /api/admin/incidents/{id}/notes.</summary>
public class AddIncidentNoteRequest
{
    [Required, MinLength(1), MaxLength(2000)]
    public required string Content { get; set; }
}

// ── Audit Log ────────────────────────────────────────────────────────────────
public record AuditLogEntryResponse(
    Guid Id,
    string Action,
    Guid? UserId,
    string? UserEmail,
    string? EntityType,
    Guid? EntityId,
    string? Details,
    DateTimeOffset CreatedAt);
public record AuditLogListResponse(
    IReadOnlyList<AuditLogEntryResponse> Items,
    int Total,
    int Page,
    int PageSize);

// ── Reports ──────────────────────────────────────────────────────────────────
public record AdminReportResponse(
    Guid Id,
    Guid FamilyId,
    string FamilyName,
    Guid? BookingId,
    Guid? IncidentId,
    ReportType ReportType,
    string Title,
    string Description,
    string? FileUrl,
    DateTimeOffset GeneratedAt);

public record AdminReportListResponse(
    IReadOnlyList<AdminReportResponse> Items,
    int Total,
    int Page,
    int PageSize);

/// <summary>Slim incident summary attached to a report detail response.</summary>
public record ReportLinkedIncidentInfo(
    Guid Id,
    IncidentType Type,
    IncidentSeverity Severity,
    IncidentStatus Status,
    string Summary);

/// <summary>Slim booking summary attached to a report detail response.</summary>
public record ReportLinkedBookingInfo(
    Guid Id,
    string PackageName,
    BookingStatus Status,
    DateTimeOffset CreatedAt);

/// <summary>Full report detail returned by GET /api/admin/reports/{id}.</summary>
public record AdminReportDetailResponse(
    Guid Id,
    Guid FamilyId,
    string FamilyName,
    Guid? BookingId,
    Guid? IncidentId,
    ReportType ReportType,
    string Title,
    string Description,
    string? FileUrl,
    DateTimeOffset GeneratedAt,
    ReportLinkedIncidentInfo? LinkedIncident,
    ReportLinkedBookingInfo? LinkedBooking);

// ── Service Packages (admin management) ───────────────────────────────────────
public record AdminServicePackageResponse(
    Guid Id,
    string Title,
    string Code,
    string Description,
    decimal Price,
    string Currency,
    int DurationMinutes,
    bool IsActive,
    bool IsVisible,
    string PriceDisplay,
    string DurationLabel,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public class CreateServicePackageRequest
{
    [Required, MaxLength(200)]
    public required string Title { get; set; }

    [Required, MaxLength(50)]
    [RegularExpression("^[A-Za-z0-9-]+$", ErrorMessage = "Code may only contain letters, numbers, and hyphens.")]
    public required string Code { get; set; }

    [Required, MaxLength(1000)]
    public required string Description { get; set; }

    [Range(0, 1000000000)]
    public required decimal Price { get; set; }

    [Required, MinLength(3), MaxLength(3)]
    [RegularExpression("^[A-Za-z]{3}$", ErrorMessage = "Currency must be a 3-letter code, e.g. USD.")]
    public required string Currency { get; set; }

    [Range(1, 10080)]
    public required int DurationMinutes { get; set; }

    public bool IsVisible { get; set; } = true;
}

public class UpdateServicePackageRequest
{
    [Required, MaxLength(200)]
    public required string Title { get; set; }

    [Required, MaxLength(50)]
    [RegularExpression("^[A-Za-z0-9-]+$", ErrorMessage = "Code may only contain letters, numbers, and hyphens.")]
    public required string Code { get; set; }

    [Required, MaxLength(1000)]
    public required string Description { get; set; }

    [Range(0, 1000000000)]
    public required decimal Price { get; set; }

    [Required, MinLength(3), MaxLength(3)]
    [RegularExpression("^[A-Za-z]{3}$", ErrorMessage = "Currency must be a 3-letter code, e.g. USD.")]
    public required string Currency { get; set; }

    [Range(1, 10080)]
    public required int DurationMinutes { get; set; }

    [Required]
    public bool? IsVisible { get; set; }
}

public class UpdateServicePackageStatusRequest
{
    [Required]
    public bool? IsActive { get; set; }
}

// ── Admin Users ───────────────────────────────────────────────────────────────

/// <summary>Slim family summary embedded in user detail response.</summary>
public record AdminUserFamilySummary(
    Guid FamilyId,
    string FamilyName,
    FamilyMemberRole FamilyMemberRole);

/// <summary>Row item returned by GET /api/admin/users.</summary>
public record AdminUserResponse(
    Guid Id,
    string Email,
    string DisplayName,
    UserRole Role,
    UserStatus Status,
    bool EmailVerified,
    DateTimeOffset CreatedAt,
    DateTimeOffset? LastLoginAt,
    AdminUserFamilySummary? Family);

/// <summary>Full detail returned by GET /api/admin/users/{id}.</summary>
public record AdminUserDetailResponse(
    Guid Id,
    string Email,
    string DisplayName,
    string? Phone,
    UserRole Role,
    UserStatus Status,
    bool EmailVerified,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    DateTimeOffset? LastLoginAt,
    AdminUserFamilySummary? Family);

/// <summary>Paged list of users wrapper.</summary>
public record AdminUserListResponse(
    IReadOnlyList<AdminUserResponse> Items,
    int Total,
    int Page,
    int PageSize);

// ── Admin User Actions ────────────────────────────────────────────────────────

/// <summary>Request body for PATCH /api/admin/users/{id}/status.</summary>
public class UpdateUserStatusRequest
{
    [Required]
    public required UserStatus Status { get; set; }
}

/// <summary>Request body for PATCH /api/admin/users/{id}/role.</summary>
public class UpdateUserRoleRequest
{
    [Required]
    public required UserRole Role { get; set; }
}

/// <summary>
/// Returned after POST /api/admin/users/{id}/trigger-password-reset.
/// The token is short-lived (24 h) and single-use. Share it with the user
/// via a secure out-of-band channel until email delivery is implemented.
/// </summary>
public record TriggerPasswordResetResponse(
    string Token,
    DateTimeOffset ExpiresAt);

// ── Customer Detail ───────────────────────────────────────────────────────────

/// <summary>Owner user info embedded in the customer detail response.</summary>
public record AdminCustomerOwnerInfo(
    Guid UserId,
    string Email,
    string DisplayName,
    string? Phone,
    UserStatus Status,
    bool EmailVerified,
    DateTimeOffset? LastLoginAt);

/// <summary>Family member row embedded in the customer detail response.</summary>
public record AdminCustomerMemberInfo(
    Guid UserId,
    string Email,
    string DisplayName,
    FamilyMemberRole Role,
    UserStatus Status,
    DateTimeOffset JoinedAt);

/// <summary>Active account (non-archived) associated with the family.</summary>
public record AdminCustomerAccountInfo(
    Guid AccountId,
    AccountType AccountType,
    string MaskedIdentifier,
    TwoFactorStatus TwoFactorStatus,
    RecoveryStatus RecoveryEmailStatus,
    RecoveryStatus RecoveryPhoneStatus,
    bool SuspiciousActivityFlag,
    string? Notes,
    DateTimeOffset CreatedAt);

/// <summary>Active device (non-archived) associated with the family.</summary>
public record AdminCustomerDeviceInfo(
    Guid DeviceId,
    DeviceType DeviceType,
    string Brand,
    string Model,
    string OsName,
    string OsVersion,
    SupportStatus SupportStatus,
    bool ScreenLockEnabled,
    bool BiometricEnabled,
    bool BackupEnabled,
    bool FindMyDeviceEnabled,
    string? Notes,
    DateTimeOffset CreatedAt);

/// <summary>Most recent assessment result for the family.</summary>
public record AdminCustomerAssessmentInfo(
    Guid AssessmentId,
    int OverallScore,
    int AccountSecurityScore,
    int DeviceHygieneScore,
    int BackupRecoveryScore,
    int PrivacySharingScore,
    int ScamReadinessScore,
    RiskLevel RiskLevel,
    DateTimeOffset CompletedAt);

/// <summary>Aggregated checklist item counts across all statuses.</summary>
public record AdminCustomerChecklistSummary(
    int Total,
    int Pending,
    int Completed,
    int Dismissed,
    int InProgress);

/// <summary>Incident row embedded in the customer detail response.</summary>
public record AdminCustomerIncidentInfo(
    Guid IncidentId,
    IncidentType Type,
    IncidentSeverity Severity,
    IncidentStatus Status,
    string Summary,
    DateTimeOffset CreatedAt);

/// <summary>Booking row embedded in the customer detail response.</summary>
public record AdminCustomerBookingInfo(
    Guid BookingId,
    Guid PackageId,
    string PackageName,
    DateTimeOffset PreferredStartAt,
    BookingChannel Channel,
    BookingStatus Status,
    PaymentStatus PaymentStatus,
    string? Notes,
    DateTimeOffset CreatedAt);

/// <summary>Report row embedded in the customer detail response.</summary>
public record AdminCustomerReportInfo(
    Guid ReportId,
    ReportType ReportType,
    string Title,
    string Description,
    string? FileUrl,
    Guid? BookingId,
    Guid? IncidentId,
    DateTimeOffset GeneratedAt);

/// <summary>Internal admin note attached to the family.</summary>
public record AdminCustomerNoteInfo(
    Guid NoteId,
    string Content,
    Guid AuthorId,
    string AuthorEmail,
    DateTimeOffset CreatedAt);

/// <summary>
/// Full operational overview for a single customer family.
/// Returned by GET /api/admin/customers/{familyId}.
/// </summary>
public record AdminCustomerDetailResponse(
    Guid FamilyId,
    string FamilyName,
    string CountryCode,
    string Timezone,
    DateTimeOffset CreatedAt,
    AdminCustomerOwnerInfo? Owner,
    IReadOnlyList<AdminCustomerMemberInfo> Members,
    IReadOnlyList<AdminCustomerAccountInfo> Accounts,
    IReadOnlyList<AdminCustomerDeviceInfo> Devices,
    AdminCustomerAssessmentInfo? LatestAssessment,
    AdminCustomerChecklistSummary ChecklistSummary,
    IReadOnlyList<AdminCustomerIncidentInfo> Incidents,
    IReadOnlyList<AdminCustomerBookingInfo> Bookings,
    IReadOnlyList<AdminCustomerReportInfo> Reports,
    IReadOnlyList<AdminCustomerNoteInfo> Notes);

/// <summary>Request body for POST /api/admin/customers/{familyId}/notes.</summary>
public class AddCustomerNoteRequest
{
    [Required, MinLength(1), MaxLength(2000)]
    public required string Content { get; set; }
}

// ── Admin Internal Notes ──────────────────────────────────────────────────────

/// <summary>Enum-like string identifying the related entity type for an admin note.</summary>
public enum AdminNoteEntityType
{
    Family,
    Booking,
    Incident,
}

/// <summary>Row item returned by GET /api/admin/notes.</summary>
public record AdminNoteResponse(
    Guid Id,
    string Content,
    Guid AuthorId,
    string AuthorEmail,
    AdminNoteEntityType? EntityType,
    Guid? EntityId,
    string? EntityLabel,
    DateTimeOffset CreatedAt);

/// <summary>Paged list of admin internal notes.</summary>
public record AdminNoteListResponse(
    IReadOnlyList<AdminNoteResponse> Items,
    int Total,
    int Page,
    int PageSize);

/// <summary>Request body for POST /api/admin/notes.</summary>
public class CreateAdminNoteRequest
{
    [Required, MinLength(1), MaxLength(2000)]
    public required string Content { get; set; }

    public Guid? FamilyId { get; set; }
    public Guid? BookingId { get; set; }
    public Guid? IncidentId { get; set; }
}