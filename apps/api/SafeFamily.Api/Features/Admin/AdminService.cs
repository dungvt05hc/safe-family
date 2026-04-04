using System.Globalization;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Accounts;
using SafeFamily.Api.Domain.Admin;
using SafeFamily.Api.Domain.Assessments;
using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Domain.Checklists;
using SafeFamily.Api.Domain.Families;
using SafeFamily.Api.Domain.Incidents;
using SafeFamily.Api.Domain.Reports;
using SafeFamily.Api.Domain.Users;
using SafeFamily.Api.Features.Admin.Dtos;

namespace SafeFamily.Api.Features.Admin;

public class AdminService : IAdminService
{
    private readonly AppDbContext _db;
    private static readonly Regex ServicePackageCodeRegex = new("^[A-Za-z0-9-]+$", RegexOptions.Compiled);
    private static readonly Regex ServicePackageCurrencyRegex = new("^[A-Za-z]{3}$", RegexOptions.Compiled);

    public AdminService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<AdminDashboardResponse> GetDashboardAsync(CancellationToken ct = default)
    {
        var totalUsers      = await _db.Users.CountAsync(ct);
        var totalFamilies   = await _db.Families.CountAsync(ct);
        var totalMembers    = await _db.FamilyMembers.CountAsync(ct);
        var totalBookings   = await _db.Bookings.CountAsync(ct);
        var totalIncidents  = await _db.Incidents.CountAsync(ct);
        var totalReports    = await _db.Reports.CountAsync(ct);
        var openIncidents   = await _db.Incidents.CountAsync(i => i.Status == IncidentStatus.Open, ct);
        // Submitted = paid packages awaiting admin confirmation; also count Paid (payment received)
        var pendingBookings = await _db.Bookings.CountAsync(
            b => b.Status == BookingStatus.Submitted || b.Status == BookingStatus.Paid, ct);

        // Families whose most recent assessment flags High or Critical risk
        var highRiskFamilies = await _db.Assessments
            .GroupBy(a => a.FamilyId)
            .CountAsync(g => g.OrderByDescending(a => a.CreatedAt)
                              .First().RiskLevel >= RiskLevel.High, ct);

        var recentBookings = await _db.Bookings
            .Include(b => b.Family)
            .Include(b => b.Package)
            .OrderByDescending(b => b.CreatedAt)
            .Take(5)
            .Select(b => new DashboardBookingRow(
                b.Id, b.Family.DisplayName, b.Package.Name,
                b.Status, b.PaymentStatus, b.PreferredStartAt, b.CreatedAt))
            .ToListAsync(ct);

        var recentIncidents = await _db.Incidents
            .Include(i => i.Family)
            .OrderByDescending(i => i.CreatedAt)
            .Take(5)
            .Select(i => new DashboardIncidentRow(
                i.Id, i.Family.DisplayName,
                i.Type, i.Severity, i.Status, i.Summary, i.CreatedAt))
            .ToListAsync(ct);

        var recentAuditLogs = await _db.AuditLogs
            .OrderByDescending(l => l.CreatedAt)
            .Take(10)
            .Select(l => new AuditLogEntryResponse(
                l.Id, l.Action, l.UserId, l.UserEmail,
                l.EntityType, l.EntityId, l.Details, l.CreatedAt))
            .ToListAsync(ct);

        return new AdminDashboardResponse(
            totalUsers, totalFamilies, totalMembers,
            totalBookings, totalIncidents, totalReports,
            openIncidents, pendingBookings, highRiskFamilies,
            recentBookings, recentIncidents, recentAuditLogs);
    }

    public async Task<AdminCustomerListResponse> GetCustomerListAsync(
        string? search, RiskLevel? riskLevel, string? planType,
        int page, int pageSize, CancellationToken ct = default)
    {
        if (page < 1) page = 1;
        if (pageSize is < 1 or > 200) pageSize = 25;

        // Project family aggregate with all computed operational fields.
        // Correlated subqueries are translated to SQL by EF Core.
        var q = _db.Families.Select(f => new
        {
            FamilyId        = f.Id,
            FamilyName      = f.DisplayName,
            f.CountryCode,
            f.CreatedAt,
            OwnerEmail      = f.Members
                                .Where(m => m.Role == FamilyMemberRole.Owner)
                                .Select(m => m.User.Email)
                                .FirstOrDefault(),
            OwnerDisplayName = f.Members
                                .Where(m => m.Role == FamilyMemberRole.Owner)
                                .Select(m => m.User.DisplayName)
                                .FirstOrDefault(),
            OwnerPhone      = f.Members
                                .Where(m => m.Role == FamilyMemberRole.Owner)
                                .Select(m => m.User.Phone)
                                .FirstOrDefault(),
            MemberCount     = f.Members.Count(),
            LatestRiskLevel = _db.Assessments
                                .Where(a => a.FamilyId == f.Id)
                                .OrderByDescending(a => a.CreatedAt)
                                .Select(a => (RiskLevel?)a.RiskLevel)
                                .FirstOrDefault(),
            OpenIncidentCount   = _db.Incidents
                                    .Count(i => i.FamilyId == f.Id && i.Status == IncidentStatus.Open),
            PendingBookingCount = _db.Bookings
                                    .Count(b => b.FamilyId == f.Id
                                        && (b.Status == BookingStatus.Submitted || b.Status == BookingStatus.Paid)),
            LatestPlanType  = _db.Bookings
                                .Where(b => b.FamilyId == f.Id)
                                .OrderByDescending(b => b.CreatedAt)
                                .Select(b => b.Package.Name)
                                .FirstOrDefault(),
        });

        // ── Filters ───────────────────────────────────────────────────────────
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            q = q.Where(x =>
                x.FamilyName.ToLower().Contains(term) ||
                (x.OwnerEmail       != null && x.OwnerEmail.ToLower().Contains(term)) ||
                (x.OwnerDisplayName != null && x.OwnerDisplayName.ToLower().Contains(term)) ||
                (x.OwnerPhone       != null && x.OwnerPhone.ToLower().Contains(term)));
        }

        if (riskLevel.HasValue)
            q = q.Where(x => x.LatestRiskLevel == riskLevel.Value);

        if (!string.IsNullOrWhiteSpace(planType))
            q = q.Where(x => x.LatestPlanType == planType.Trim());

        var total = await q.CountAsync(ct);

        var items = await q
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var rows = items
            .Select(x => new AdminCustomerRow(
                x.FamilyId,
                x.FamilyName,
                x.CountryCode,
                x.OwnerEmail,
                x.OwnerDisplayName,
                x.OwnerPhone,
                x.MemberCount,
                x.LatestRiskLevel,
                x.OpenIncidentCount,
                x.PendingBookingCount,
                x.LatestPlanType,
                x.CreatedAt))
            .ToList();

        return new AdminCustomerListResponse(rows, total, page, pageSize);
    }

    public async Task<AdminCustomerDetailResponse> GetCustomerDetailAsync(
        Guid familyId, CancellationToken ct = default)
    {
        var family = await _db.Families
            .FirstOrDefaultAsync(f => f.Id == familyId, ct)
            ?? throw new NotFoundException("Family", familyId);

        // Owner — loaded with navigation so we can read User.* fields
        var ownerMember = await _db.FamilyMembers
            .Include(m => m.User)
            .Where(m => m.FamilyId == familyId && m.Role == FamilyMemberRole.Owner)
            .FirstOrDefaultAsync(ct);

        // Members (Owner first, then alphabetical)
        var memberRows = await _db.FamilyMembers
            .Include(m => m.User)
            .Where(m => m.FamilyId == familyId)
            .OrderBy(m => m.Role)
            .ThenBy(m => m.User.DisplayName)
            .ToListAsync(ct);

        var members = memberRows
            .Select(m => new AdminCustomerMemberInfo(
                m.UserId, m.User.Email, m.User.DisplayName,
                m.Role, m.User.Status, m.CreatedAt))
            .ToList();

        // Accounts — active only (no archived)
        var accounts = await _db.Accounts
            .Where(a => a.FamilyId == familyId && a.ArchivedAt == null)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AdminCustomerAccountInfo(
                a.Id, a.AccountType, a.MaskedIdentifier,
                a.TwoFactorStatus, a.RecoveryEmailStatus, a.RecoveryPhoneStatus,
                a.SuspiciousActivityFlag, a.Notes, a.CreatedAt))
            .ToListAsync(ct);

        // Devices — active only (no archived)
        var devices = await _db.Devices
            .Where(d => d.FamilyId == familyId && d.ArchivedAt == null)
            .OrderByDescending(d => d.CreatedAt)
            .Select(d => new AdminCustomerDeviceInfo(
                d.Id, d.DeviceType, d.Brand, d.Model, d.OsName, d.OsVersion,
                d.SupportStatus, d.ScreenLockEnabled, d.BiometricEnabled,
                d.BackupEnabled, d.FindMyDeviceEnabled, d.Notes, d.CreatedAt))
            .ToListAsync(ct);

        // Latest assessment
        var latestAssessment = await _db.Assessments
            .Where(a => a.FamilyId == familyId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AdminCustomerAssessmentInfo(
                a.Id, a.OverallScore, a.AccountSecurityScore, a.DeviceHygieneScore,
                a.BackupRecoveryScore, a.PrivacySharingScore, a.ScamReadinessScore,
                a.RiskLevel, a.CreatedAt))
            .FirstOrDefaultAsync(ct);

        // Checklist summary: aggregate counts per status
        var checklistCounts = await _db.ChecklistItems
            .Where(c => c.FamilyId == familyId)
            .GroupBy(c => c.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var ckPending    = checklistCounts.FirstOrDefault(c => c.Status == ChecklistItemStatus.Pending)?.Count    ?? 0;
        var ckCompleted  = checklistCounts.FirstOrDefault(c => c.Status == ChecklistItemStatus.Completed)?.Count  ?? 0;
        var ckDismissed  = checklistCounts.FirstOrDefault(c => c.Status == ChecklistItemStatus.Dismissed)?.Count  ?? 0;
        var ckInProgress = checklistCounts.FirstOrDefault(c => c.Status == ChecklistItemStatus.InProgress)?.Count ?? 0;
        var checklistSummary = new AdminCustomerChecklistSummary(
            ckPending + ckCompleted + ckDismissed + ckInProgress,
            ckPending, ckCompleted, ckDismissed, ckInProgress);

        // Incidents — newest first
        var incidents = await _db.Incidents
            .Where(i => i.FamilyId == familyId)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new AdminCustomerIncidentInfo(
                i.Id, i.Type, i.Severity, i.Status, i.Summary, i.CreatedAt))
            .ToListAsync(ct);

        // Bookings — newest first
        var bookings = await _db.Bookings
            .Where(b => b.FamilyId == familyId)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new AdminCustomerBookingInfo(
                b.Id, b.PackageId, b.Package.Name,
                b.PreferredStartAt, b.Channel, b.Status, b.PaymentStatus, b.Notes, b.CreatedAt))
            .ToListAsync(ct);

        // Reports — newest first
        var reports = await _db.Reports
            .Where(r => r.FamilyId == familyId)
            .OrderByDescending(r => r.GeneratedAt)
            .Select(r => new AdminCustomerReportInfo(
                r.Id, r.ReportType, r.Title, r.Description, r.FileUrl,
                r.BookingId, r.IncidentId, r.GeneratedAt))
            .ToListAsync(ct);

        // Internal admin notes — newest first
        var notes = await _db.FamilyNotes
            .Where(n => n.FamilyId == familyId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new AdminCustomerNoteInfo(
                n.Id, n.Content, n.AuthorId, n.AuthorEmail, n.CreatedAt))
            .ToListAsync(ct);

        var owner = ownerMember is null
            ? null
            : new AdminCustomerOwnerInfo(
                ownerMember.UserId, ownerMember.User.Email, ownerMember.User.DisplayName,
                ownerMember.User.Phone, ownerMember.User.Status,
                ownerMember.User.EmailVerified, ownerMember.User.LastLoginAt);

        return new AdminCustomerDetailResponse(
            family.Id, family.DisplayName, family.CountryCode, family.Timezone, family.CreatedAt,
            owner, members, accounts, devices, latestAssessment, checklistSummary,
            incidents, bookings, reports, notes);
    }

    public async Task<AdminCustomerNoteInfo> AddCustomerNoteAsync(
        Guid familyId, string content, Guid adminId, string adminEmail,
        CancellationToken ct = default)
    {
        var familyExists = await _db.Families.AnyAsync(f => f.Id == familyId, ct);
        if (!familyExists)
            throw new NotFoundException("Family", familyId);

        var note = new FamilyNote
        {
            FamilyId    = familyId,
            Content     = content.Trim(),
            AuthorId    = adminId,
            AuthorEmail = adminEmail,
        };

        _db.FamilyNotes.Add(note);
        await _db.SaveChangesAsync(ct);

        return new AdminCustomerNoteInfo(
            note.Id, note.Content, note.AuthorId, note.AuthorEmail, note.CreatedAt);
    }

    public async Task<AdminBookingListResponse> GetBookingsPagedAsync(
        string? search,
        BookingQuickFilter? quickFilter,
        BookingStatus? status,
        PaymentStatus? paymentStatus,
        BookingChannel? channel,
        BookingSource? source,
        Guid? assignedAdminId,
        Guid? packageId,
        DateTimeOffset? from, DateTimeOffset? to,
        int page, int pageSize, CancellationToken ct = default)
    {
        if (page < 1) page = 1;
        if (pageSize is < 1 or > 200) pageSize = 25;

        var q = _db.Bookings
            .Include(b => b.Family)
            .Include(b => b.Package)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            q = q.Where(b =>
                b.Family.DisplayName.ToLower().Contains(term) ||
                b.Package.Name.ToLower().Contains(term));
        }

        // Quick-filter takes precedence over individual status/paymentStatus filters
        if (quickFilter.HasValue)
        {
            q = quickFilter.Value switch
            {
                BookingQuickFilter.PendingPayment   => q.Where(b => b.Status == BookingStatus.Submitted &&
                                                                     (b.PaymentStatus == PaymentStatus.Unpaid || b.PaymentStatus == PaymentStatus.Pending)),
                BookingQuickFilter.PaidNotConfirmed => q.Where(b => b.Status == BookingStatus.Paid),
                BookingQuickFilter.Confirmed        => q.Where(b => b.Status == BookingStatus.Confirmed),
                BookingQuickFilter.Scheduled        => q.Where(b => b.Status == BookingStatus.Scheduled),
                BookingQuickFilter.InProgress       => q.Where(b => b.Status == BookingStatus.InProgress),
                BookingQuickFilter.Completed        => q.Where(b => b.Status == BookingStatus.Completed),
                BookingQuickFilter.Cancelled        => q.Where(b => b.Status == BookingStatus.Cancelled),
                BookingQuickFilter.Expired          => q.Where(b => b.Status == BookingStatus.Expired),
                _                                   => q,
            };
        }
        else
        {
            if (status.HasValue)
                q = q.Where(b => b.Status == status.Value);

            if (paymentStatus.HasValue)
                q = q.Where(b => b.PaymentStatus == paymentStatus.Value);
        }

        if (channel.HasValue)
            q = q.Where(b => b.Channel == channel.Value);

        if (source.HasValue)
            q = q.Where(b => b.Source == source.Value);

        if (assignedAdminId.HasValue)
            q = q.Where(b => b.AssignedAdminId == assignedAdminId.Value);

        if (packageId.HasValue)
            q = q.Where(b => b.PackageId == packageId.Value);

        if (from.HasValue)
            q = q.Where(b => b.PreferredStartAt >= from.Value);

        // "to" is treated as end-of-day inclusive: include all bookings whose
        // preferred start falls on or before the chosen date.  The frontend sends
        // a date-only string ("YYYY-MM-DD"), so the parsed DateTimeOffset is
        // midnight of that day.  Using an exclusive upper-bound of midnight the
        // *next* day captures every booking on the chosen date regardless of time.
        if (to.HasValue)
            q = q.Where(b => b.PreferredStartAt < to.Value.AddDays(1));

        var total = await q.CountAsync(ct);

        var raw = await q
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(b => new
            {
                b.Id, b.FamilyId, FamilyName = b.Family.DisplayName,
                b.PackageId, PackageName = b.Package.Name,
                b.SnapshotPackageCode, b.SnapshotPrice, b.SnapshotCurrency, b.SnapshotDurationMinutes,
                b.PreferredStartAt, b.ScheduledStartAt, b.ScheduledEndAt,
                b.Channel, b.Source, b.SourceIncidentId, b.SourceAssessmentId,
                b.Notes, b.Status, b.PaymentStatus, b.ExpiresAt,
                b.AssignedAdminId, b.AssignedAdminEmail,
                b.CreatedAt, b.UpdatedAt,
                LatestPayment = _db.PaymentOrders
                    .Where(p => p.BookingId == b.Id)
                    .OrderByDescending(p => p.CreatedAt)
                    .Select(p => new { p.Id, p.Amount, p.Currency, p.Status, p.GatewayProvider, p.PaidAt, p.ExpiresAt, p.CreatedAt })
                    .FirstOrDefault(),
            })
            .ToListAsync(ct);

        var items = raw.Select(b => new AdminBookingResponse(
            b.Id, b.FamilyId, b.FamilyName,
            b.PackageId, b.PackageName,
            b.SnapshotPackageCode, b.SnapshotPrice, b.SnapshotCurrency, b.SnapshotDurationMinutes,
            b.PreferredStartAt, b.ScheduledStartAt, b.ScheduledEndAt,
            b.Channel, b.Source, b.SourceIncidentId, b.SourceAssessmentId,
            b.Notes, b.Status, b.PaymentStatus, b.ExpiresAt,
            b.AssignedAdminId, b.AssignedAdminEmail,
            b.LatestPayment is null ? null : new AdminBookingPaymentSummary(
                b.LatestPayment.Id, b.LatestPayment.Amount, b.LatestPayment.Currency,
                b.LatestPayment.Status, b.LatestPayment.GatewayProvider,
                b.LatestPayment.PaidAt, b.LatestPayment.ExpiresAt, b.LatestPayment.CreatedAt),
            b.CreatedAt, b.UpdatedAt))
            .ToList();

        return new AdminBookingListResponse(items, total, page, pageSize);
    }

    public async Task<AdminBookingDetailResponse> GetBookingByIdAsync(Guid id, CancellationToken ct = default)
    {
        var booking = await _db.Bookings
            .Include(b => b.Family)
            .Include(b => b.Package)
            .Include(b => b.PaymentOrders)
            .Include(b => b.Events)
            .FirstOrDefaultAsync(b => b.Id == id, ct)
            ?? throw new NotFoundException("Booking", id);

        var notes = await _db.BookingNotes
            .Where(n => n.BookingId == id)
            .OrderBy(n => n.CreatedAt)
            .Select(n => new AdminBookingNoteInfo(n.Id, n.Content, n.AuthorId, n.AuthorEmail, n.CreatedAt))
            .ToListAsync(ct);

        // Resolve source entity names when applicable
        string? sourceIncidentSummary = null;
        if (booking.SourceIncidentId.HasValue)
        {
            sourceIncidentSummary = await _db.Incidents
                .Where(i => i.Id == booking.SourceIncidentId.Value)
                .Select(i => i.Summary)
                .FirstOrDefaultAsync(ct);
        }

        DateTimeOffset? sourceAssessmentDate = null;
        if (booking.SourceAssessmentId.HasValue)
        {
            sourceAssessmentDate = await _db.Assessments
                .Where(a => a.Id == booking.SourceAssessmentId.Value)
                .Select(a => (DateTimeOffset?)a.CreatedAt)
                .FirstOrDefaultAsync(ct);
        }

        var paymentOrders = booking.PaymentOrders
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new AdminBookingPaymentOrderInfo(
                p.Id, p.Amount, p.Currency, p.Status,
                p.GatewayProvider, p.GatewayOrderId, p.GatewayTransactionId,
                p.PaymentUrl, p.QrCodeUrl,
                p.PaidAt, p.ExpiresAt, p.FailedAt, p.RefundedAt, p.RefundedAmount,
                p.CreatedAt))
            .ToList();

        var events = booking.Events
            .OrderBy(e => e.CreatedAt)
            .Select(e => new AdminBookingEventInfo(
                e.Id, e.EventType, e.FromValue, e.ToValue,
                e.Description, e.ActorId, e.ActorEmail, e.CreatedAt))
            .ToList();

        var latestPaymentOrder = booking.PaymentOrders.OrderByDescending(p => p.CreatedAt).FirstOrDefault();
        var latestPayment = latestPaymentOrder is null ? null : new AdminBookingPaymentSummary(
            latestPaymentOrder.Id, latestPaymentOrder.Amount, latestPaymentOrder.Currency,
            latestPaymentOrder.Status, latestPaymentOrder.GatewayProvider,
            latestPaymentOrder.PaidAt, latestPaymentOrder.ExpiresAt, latestPaymentOrder.CreatedAt);

        return new AdminBookingDetailResponse(
            booking.Id, booking.FamilyId, booking.Family.DisplayName,
            booking.PackageId, booking.Package.Name,
            booking.SnapshotPackageCode, booking.SnapshotPrice, booking.SnapshotCurrency, booking.SnapshotDurationMinutes,
            booking.PreferredStartAt, booking.ScheduledStartAt, booking.ScheduledEndAt,
            booking.Channel, booking.Source, booking.SourceIncidentId, booking.SourceAssessmentId,
            sourceIncidentSummary, sourceAssessmentDate,
            booking.Notes, booking.Status, booking.PaymentStatus, booking.ExpiresAt,
            booking.AssignedAdminId, booking.AssignedAdminEmail,
            latestPayment,
            booking.CreatedAt, booking.UpdatedAt,
            paymentOrders, events, notes);
    }

    public async Task<AdminBookingResponse> UpdatePaymentStatusAsync(Guid bookingId, PaymentStatus newStatus, Guid actorId, string actorEmail, CancellationToken ct = default)
    {
        var booking = await _db.Bookings
            .Include(b => b.Family)
            .Include(b => b.Package)
            .FirstOrDefaultAsync(b => b.Id == bookingId, ct);

        if (booking is null)
            throw new NotFoundException("Booking", bookingId);

        var oldStatus = booking.PaymentStatus;
        booking.PaymentStatus = newStatus;

        _db.BookingEvents.Add(new BookingEvent
        {
            BookingId   = bookingId,
            EventType   = "PaymentStatusChanged",
            FromValue   = oldStatus.ToString(),
            ToValue     = newStatus.ToString(),
            Description = "Payment status changed by admin",
            ActorId     = actorId,
            ActorEmail  = actorEmail,
        });

        await _db.SaveChangesAsync(ct);

        var latestPayment = await GetLatestPaymentSummaryAsync(bookingId, ct);
        return ToBookingResponse(booking, latestPayment);
    }

    public async Task<AdminBookingResponse> UpdateAdminBookingStatusAsync(Guid bookingId, BookingStatus newStatus, Guid actorId, string actorEmail, CancellationToken ct = default)
    {
        var booking = await _db.Bookings
            .Include(b => b.Family)
            .Include(b => b.Package)
            .FirstOrDefaultAsync(b => b.Id == bookingId, ct);

        if (booking is null)
            throw new NotFoundException("Booking", bookingId);

        var oldStatus = booking.Status;
        booking.Status = newStatus;

        _db.BookingEvents.Add(new BookingEvent
        {
            BookingId   = bookingId,
            EventType   = "StatusChanged",
            FromValue   = oldStatus.ToString(),
            ToValue     = newStatus.ToString(),
            Description = "Status changed by admin",
            ActorId     = actorId,
            ActorEmail  = actorEmail,
        });

        await _db.SaveChangesAsync(ct);

        var latestPayment = await GetLatestPaymentSummaryAsync(bookingId, ct);
        return ToBookingResponse(booking, latestPayment);
    }

    public async Task<AdminBookingResponse> AssignBookingAsync(
        Guid id, Guid? adminId, string? adminEmail, Guid actorId, string actorEmail, CancellationToken ct = default)
    {
        var booking = await _db.Bookings
            .Include(b => b.Family)
            .Include(b => b.Package)
            .FirstOrDefaultAsync(b => b.Id == id, ct)
            ?? throw new NotFoundException("Booking", id);

        var previousAdminEmail = booking.AssignedAdminEmail;
        booking.AssignedAdminId    = adminId;
        booking.AssignedAdminEmail = adminEmail?.Trim();

        _db.BookingEvents.Add(new BookingEvent
        {
            BookingId   = id,
            EventType   = "AdminAssigned",
            FromValue   = previousAdminEmail,
            ToValue     = adminEmail?.Trim(),
            Description = adminEmail is null
                ? "Booking unassigned by admin"
                : $"Booking assigned to {adminEmail.Trim()} by admin",
            ActorId    = actorId,
            ActorEmail = actorEmail,
        });

        await _db.SaveChangesAsync(ct);

        var latestPayment = await GetLatestPaymentSummaryAsync(id, ct);
        return ToBookingResponse(booking, latestPayment);
    }

    private async Task<AdminBookingPaymentSummary?> GetLatestPaymentSummaryAsync(Guid bookingId, CancellationToken ct)
    {
        var p = await _db.PaymentOrders
            .Where(p => p.BookingId == bookingId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new { p.Id, p.Amount, p.Currency, p.Status, p.GatewayProvider, p.PaidAt, p.ExpiresAt, p.CreatedAt })
            .FirstOrDefaultAsync(ct);

        return p is null ? null : new AdminBookingPaymentSummary(
            p.Id, p.Amount, p.Currency, p.Status, p.GatewayProvider, p.PaidAt, p.ExpiresAt, p.CreatedAt);
    }

    private static AdminBookingResponse ToBookingResponse(Booking booking, AdminBookingPaymentSummary? latestPayment)
        => new(
            booking.Id, booking.FamilyId, booking.Family.DisplayName,
            booking.PackageId, booking.Package.Name,
            booking.SnapshotPackageCode, booking.SnapshotPrice, booking.SnapshotCurrency, booking.SnapshotDurationMinutes,
            booking.PreferredStartAt, booking.ScheduledStartAt, booking.ScheduledEndAt,
            booking.Channel, booking.Source, booking.SourceIncidentId, booking.SourceAssessmentId,
            booking.Notes, booking.Status, booking.PaymentStatus, booking.ExpiresAt,
            booking.AssignedAdminId, booking.AssignedAdminEmail,
            latestPayment,
            booking.CreatedAt, booking.UpdatedAt);

    public async Task<AdminBookingNoteInfo> AddBookingNoteAsync(
        Guid id, string content, Guid authorId, string authorEmail, CancellationToken ct = default)
    {
        var bookingExists = await _db.Bookings.AnyAsync(b => b.Id == id, ct);
        if (!bookingExists)
            throw new NotFoundException("Booking", id);

        var note = new BookingNote
        {
            BookingId   = id,
            Content     = content.Trim(),
            AuthorId    = authorId,
            AuthorEmail = authorEmail,
        };

        _db.BookingNotes.Add(note);
        await _db.SaveChangesAsync(ct);

        return new AdminBookingNoteInfo(note.Id, note.Content, note.AuthorId, note.AuthorEmail, note.CreatedAt);
    }

    public async Task<AdminIncidentListResponse> GetIncidentsPagedAsync(
        string? search, IncidentSeverity? severity, IncidentStatus? status, IncidentType? type,
        DateTimeOffset? from, DateTimeOffset? to,
        int page, int pageSize, CancellationToken ct = default)
    {
        if (page < 1) page = 1;
        if (pageSize is < 1 or > 200) pageSize = 25;

        var q = _db.Incidents
            .Include(i => i.Family)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            q = q.Where(i =>
                i.Family.DisplayName.ToLower().Contains(term) ||
                i.Summary.ToLower().Contains(term));
        }

        if (severity.HasValue)
            q = q.Where(i => i.Severity == severity.Value);

        if (status.HasValue)
            q = q.Where(i => i.Status == status.Value);

        if (type.HasValue)
            q = q.Where(i => i.Type == type.Value);

        if (from.HasValue)
            q = q.Where(i => i.CreatedAt >= from.Value);

        if (to.HasValue)
            q = q.Where(i => i.CreatedAt < to.Value.AddDays(1));

        var total = await q.CountAsync(ct);

        var items = await q
            .OrderByDescending(i => i.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new
            {
                i.Id, i.FamilyId, FamilyName = i.Family.DisplayName,
                i.Type, i.Severity, i.Status, i.Summary, i.FirstActionPlan,
                i.CreatedAt, i.UpdatedAt,
                RelatedReport = _db.Reports
                    .Where(r => r.IncidentId == i.Id)
                    .OrderByDescending(r => r.GeneratedAt)
                    .Select(r => new { r.Id, r.BookingId })
                    .FirstOrDefault(),
            })
            .ToListAsync(ct);

        var rows = items.Select(i => new AdminIncidentResponse(
            i.Id, i.FamilyId, i.FamilyName,
            i.Type, i.Severity, i.Status, i.Summary, i.FirstActionPlan,
            i.CreatedAt, i.UpdatedAt,
            i.RelatedReport != null ? i.RelatedReport.Id : null,
            i.RelatedReport != null ? i.RelatedReport.BookingId : null))
            .ToList();

        return new AdminIncidentListResponse(rows, total, page, pageSize);
    }

    public async Task<AdminIncidentDetailResponse> GetIncidentByIdAsync(Guid id, CancellationToken ct = default)
    {
        var incident = await _db.Incidents
            .Include(i => i.Family)
            .FirstOrDefaultAsync(i => i.Id == id, ct)
            ?? throw new NotFoundException("Incident", id);

        var notes = await _db.IncidentNotes
            .Where(n => n.IncidentId == id)
            .OrderBy(n => n.CreatedAt)
            .Select(n => new AdminIncidentNoteInfo(n.Id, n.Content, n.AuthorId, n.AuthorEmail, n.CreatedAt))
            .ToListAsync(ct);

        var relatedReports = await _db.Reports
            .Where(r => r.IncidentId == id)
            .OrderByDescending(r => r.GeneratedAt)
            .Select(r => new AdminIncidentRelatedReport(r.Id, r.ReportType, r.Title, r.BookingId, r.GeneratedAt))
            .ToListAsync(ct);

        var firstReportId  = relatedReports.Count > 0 ? relatedReports[0].ReportId  : (Guid?)null;
        var firstBookingId = relatedReports.Count > 0 ? relatedReports[0].BookingId : null;

        return new AdminIncidentDetailResponse(
            incident.Id, incident.FamilyId, incident.Family.DisplayName,
            incident.Type, incident.Severity, incident.Status, incident.Summary,
            incident.FirstActionPlan, incident.CreatedAt, incident.UpdatedAt,
            firstReportId, firstBookingId, notes, relatedReports);
    }

    public async Task<AdminIncidentResponse> UpdateIncidentStatusAsync(Guid incidentId, IncidentStatus newStatus, CancellationToken ct = default)
    {
        var incident = await _db.Incidents
            .Include(i => i.Family)
            .FirstOrDefaultAsync(i => i.Id == incidentId, ct)
            ?? throw new NotFoundException("Incident", incidentId);

        incident.Status = newStatus;
        await _db.SaveChangesAsync(ct);

        var relatedReport = await _db.Reports
            .Where(r => r.IncidentId == incident.Id)
            .OrderByDescending(r => r.GeneratedAt)
            .Select(r => new { r.Id, r.BookingId })
            .FirstOrDefaultAsync(ct);

        return new AdminIncidentResponse(
            incident.Id, incident.FamilyId, incident.Family.DisplayName,
            incident.Type, incident.Severity, incident.Status, incident.Summary,
            incident.FirstActionPlan, incident.CreatedAt, incident.UpdatedAt,
            relatedReport?.Id, relatedReport?.BookingId);
    }

    public async Task<AdminIncidentNoteInfo> AddIncidentNoteAsync(
        Guid id, string content, Guid authorId, string authorEmail, CancellationToken ct = default)
    {
        var incidentExists = await _db.Incidents.AnyAsync(i => i.Id == id, ct);
        if (!incidentExists)
            throw new NotFoundException("Incident", id);

        var note = new IncidentNote
        {
            IncidentId  = id,
            Content     = content.Trim(),
            AuthorId    = authorId,
            AuthorEmail = authorEmail,
        };

        _db.IncidentNotes.Add(note);
        await _db.SaveChangesAsync(ct);

        return new AdminIncidentNoteInfo(note.Id, note.Content, note.AuthorId, note.AuthorEmail, note.CreatedAt);
    }


    public Task<AuditLogListResponse> GetAuditLogsAsync(int page, int pageSize, CancellationToken ct = default)
        => GetActivityAsync(null, null, null, page, pageSize, ct);

    public async Task<AuditLogListResponse> GetActivityAsync(
        string? action, DateTimeOffset? from, DateTimeOffset? to,
        int page, int pageSize, CancellationToken ct = default)
    {
        if (page < 1) page = 1;
        if (pageSize is < 1 or > 200) pageSize = 50;

        var query = _db.AuditLogs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(l => l.Action == action);
        if (from.HasValue)
            query = query.Where(l => l.CreatedAt >= from.Value);
        if (to.HasValue)
            query = query.Where(l => l.CreatedAt <= to.Value);

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new AuditLogEntryResponse(
                l.Id, l.Action, l.UserId, l.UserEmail,
                l.EntityType, l.EntityId, l.Details, l.CreatedAt))
            .ToListAsync(ct);

        return new AuditLogListResponse(items, total, page, pageSize);
    }

    // ── Reports ────────────────────────────────────────────────────────────────

    public async Task<AdminReportListResponse> GetReportsPagedAsync(
        string? search, ReportType? reportType, Guid? familyId,
        Guid? incidentId, Guid? bookingId,
        DateTimeOffset? from, DateTimeOffset? to,
        int page, int pageSize, CancellationToken ct = default)
    {
        if (page < 1) page = 1;
        if (pageSize is < 1 or > 200) pageSize = 25;

        var q = _db.Reports
            .Include(r => r.Family)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            q = q.Where(r =>
                r.Title.ToLower().Contains(term) ||
                r.Family.DisplayName.ToLower().Contains(term));
        }

        if (reportType.HasValue)
            q = q.Where(r => r.ReportType == reportType.Value);

        if (familyId.HasValue)
            q = q.Where(r => r.FamilyId == familyId.Value);

        if (incidentId.HasValue)
            q = q.Where(r => r.IncidentId == incidentId.Value);

        if (bookingId.HasValue)
            q = q.Where(r => r.BookingId == bookingId.Value);

        if (from.HasValue)
            q = q.Where(r => r.GeneratedAt >= from.Value);

        if (to.HasValue)
            q = q.Where(r => r.GeneratedAt < to.Value.AddDays(1));

        var total = await q.CountAsync(ct);

        var items = await q
            .OrderByDescending(r => r.GeneratedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new AdminReportResponse(
                r.Id, r.FamilyId, r.Family.DisplayName,
                r.BookingId, r.IncidentId,
                r.ReportType, r.Title, r.Description,
                r.FileUrl, r.GeneratedAt))
            .ToListAsync(ct);

        return new AdminReportListResponse(items, total, page, pageSize);
    }

    public async Task<AdminReportDetailResponse> GetReportByIdAsync(Guid id, CancellationToken ct = default)
    {
        var report = await _db.Reports
            .Include(r => r.Family)
            .FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw new NotFoundException("Report", id);

        ReportLinkedIncidentInfo? linkedIncident = null;
        if (report.IncidentId.HasValue)
        {
            linkedIncident = await _db.Incidents
                .Where(i => i.Id == report.IncidentId.Value)
                .Select(i => new ReportLinkedIncidentInfo(
                    i.Id, i.Type, i.Severity, i.Status, i.Summary))
                .FirstOrDefaultAsync(ct);
        }

        ReportLinkedBookingInfo? linkedBooking = null;
        if (report.BookingId.HasValue)
        {
            linkedBooking = await _db.Bookings
                .Where(b => b.Id == report.BookingId.Value)
                .Select(b => new ReportLinkedBookingInfo(
                    b.Id, b.Package.Name, b.Status, b.CreatedAt))
                .FirstOrDefaultAsync(ct);
        }

        return new AdminReportDetailResponse(
            report.Id, report.FamilyId, report.Family.DisplayName,
            report.BookingId, report.IncidentId,
            report.ReportType, report.Title, report.Description,
            report.FileUrl, report.GeneratedAt,
            linkedIncident, linkedBooking);
    }

    // ── Service Packages ───────────────────────────────────────────────────────

    public async Task<IReadOnlyList<AdminServicePackageResponse>> GetServicePackagesAdminAsync(CancellationToken ct = default)
    {
        return await _db.ServicePackages
            .AsNoTracking()
            .OrderBy(p => p.CreatedAt)
            .Select(p => new AdminServicePackageResponse(
                p.Id,
                p.Name,
                p.Code,
                p.Description,
                p.Price,
                p.Currency,
                p.DurationMinutes,
                p.IsActive,
                p.IsVisible,
                p.PriceDisplay,
                p.DurationLabel,
                p.CreatedAt, p.UpdatedAt))
            .ToListAsync(ct);
    }

    public async Task<AdminServicePackageResponse> CreateServicePackageAsync(
        CreateServicePackageRequest request,
        CancellationToken ct = default)
    {
        var normalized = NormalizeAndValidateServicePackageInput(
            request.Title,
            request.Code,
            request.Description,
            request.Price,
            request.Currency,
            request.DurationMinutes,
            request.IsVisible);

        var codeTaken = await _db.ServicePackages.AnyAsync(p => p.Code == normalized.Code, ct);
        if (codeTaken)
            throw new ConflictException($"A service package with code '{normalized.Code}' already exists.");

        var package = new ServicePackage
        {
            Name = normalized.Title,
            Code = normalized.Code,
            Description = normalized.Description,
            Price = normalized.Price,
            Currency = normalized.Currency,
            DurationMinutes = normalized.DurationMinutes,
            IsVisible = normalized.IsVisible,
            IsActive = true,
            PriceDisplay = ToPriceDisplay(normalized.Price, normalized.Currency),
            DurationLabel = ToDurationLabel(normalized.DurationMinutes),
        };

        _db.ServicePackages.Add(package);
        await _db.SaveChangesAsync(ct);

        return ToAdminPackageResponse(package);
    }

    public async Task<AdminServicePackageResponse> UpdateServicePackageAsync(
        Guid id,
        UpdateServicePackageRequest request,
        CancellationToken ct = default)
    {
        var normalized = NormalizeAndValidateServicePackageInput(
            request.Title,
            request.Code,
            request.Description,
            request.Price,
            request.Currency,
            request.DurationMinutes,
            request.IsVisible!.Value);

        var package = await _db.ServicePackages.FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException("ServicePackage", id);

        var codeTaken = await _db.ServicePackages.AnyAsync(p => p.Code == normalized.Code && p.Id != id, ct);
        if (codeTaken)
            throw new ConflictException($"A service package with code '{normalized.Code}' already exists.");

        package.Name = normalized.Title;
        package.Code = normalized.Code;
        package.Description = normalized.Description;
        package.Price = normalized.Price;
        package.Currency = normalized.Currency;
        package.DurationMinutes = normalized.DurationMinutes;
        package.IsVisible = normalized.IsVisible;
        package.PriceDisplay = ToPriceDisplay(normalized.Price, normalized.Currency);
        package.DurationLabel = ToDurationLabel(normalized.DurationMinutes);
        package.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);

        return ToAdminPackageResponse(package);
    }

    public async Task<AdminServicePackageResponse> UpdateServicePackageStatusAsync(
        Guid id,
        bool isActive,
        CancellationToken ct = default)
    {
        var package = await _db.ServicePackages.FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException("ServicePackage", id);

        package.IsActive = isActive;
        package.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);

        return ToAdminPackageResponse(package);
    }

    private static AdminServicePackageResponse ToAdminPackageResponse(ServicePackage package) =>
        new(
            package.Id,
            package.Name,
            package.Code,
            package.Description,
            package.Price,
            package.Currency,
            package.DurationMinutes,
            package.IsActive,
            package.IsVisible,
            package.PriceDisplay,
            package.DurationLabel,
            package.CreatedAt,
            package.UpdatedAt);

    private static NormalizedServicePackageInput NormalizeAndValidateServicePackageInput(
        string title,
        string code,
        string description,
        decimal price,
        string currency,
        int durationMinutes,
        bool isVisible)
    {
        var normalizedTitle = title.Trim();
        if (string.IsNullOrWhiteSpace(normalizedTitle))
            throw new AppException("Title is required.");

        var normalizedCode = code.Trim().ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(normalizedCode))
            throw new AppException("Code is required.");
        if (!ServicePackageCodeRegex.IsMatch(normalizedCode))
            throw new AppException("Code may only contain letters, numbers, and hyphens.");

        var normalizedDescription = description.Trim();
        if (string.IsNullOrWhiteSpace(normalizedDescription))
            throw new AppException("Description is required.");

        if (price < 0m || price > 1000000000m)
            throw new AppException("Price must be between 0 and 1000000000.");
        if (decimal.Round(price, 2) != price)
            throw new AppException("Price may contain at most 2 decimal places.");
        var normalizedPrice = decimal.Round(price, 2, MidpointRounding.AwayFromZero);

        var normalizedCurrency = currency.Trim().ToUpperInvariant();
        if (!ServicePackageCurrencyRegex.IsMatch(normalizedCurrency))
            throw new AppException("Currency must be a 3-letter code, e.g. USD.");

        if (durationMinutes < 1 || durationMinutes > 10080)
            throw new AppException("Duration must be between 1 and 10080 minutes.");

        return new NormalizedServicePackageInput(
            normalizedTitle,
            normalizedCode,
            normalizedDescription,
            normalizedPrice,
            normalizedCurrency,
            durationMinutes,
            isVisible);
    }

    private static string ToPriceDisplay(decimal price, string currency)
    {
        if (price == 0m)
            return "Free";

        return $"{currency} {price.ToString("0.##", CultureInfo.InvariantCulture)}";
    }

    private static string ToDurationLabel(int durationMinutes) => $"{durationMinutes} min";

    private sealed record NormalizedServicePackageInput(
        string Title,
        string Code,
        string Description,
        decimal Price,
        string Currency,
        int DurationMinutes,
        bool IsVisible);

    // ── Users ──────────────────────────────────────────────────────────────────

    public async Task<AdminUserListResponse> GetUsersAsync(
        string? search, UserRole? role, UserStatus? status, bool? emailVerified,
        int page, int pageSize, CancellationToken ct = default)
    {
        if (page < 1) page = 1;
        if (pageSize is < 1 or > 200) pageSize = 25;

        var query = _db.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(u =>
                u.Email.ToLower().Contains(term) ||
                u.DisplayName.ToLower().Contains(term));
        }

        if (role.HasValue)
            query = query.Where(u => u.Role == role.Value);

        if (status.HasValue)
            query = query.Where(u => u.Status == status.Value);

        if (emailVerified.HasValue)
            query = query.Where(u => u.EmailVerified == emailVerified.Value);

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.DisplayName,
                u.Role,
                u.Status,
                u.EmailVerified,
                u.CreatedAt,
                u.LastLoginAt,
                Member = _db.FamilyMembers
                    .Where(fm => fm.UserId == u.Id)
                    .Select(fm => new { fm.FamilyId, fm.Family.DisplayName, fm.Role })
                    .FirstOrDefault(),
            })
            .ToListAsync(ct);

        var rows = items.Select(u => new AdminUserResponse(
            u.Id,
            u.Email,
            u.DisplayName,
            u.Role,
            u.Status,
            u.EmailVerified,
            u.CreatedAt,
            u.LastLoginAt,
            u.Member is null ? null
                : new AdminUserFamilySummary(u.Member.FamilyId, u.Member.DisplayName, u.Member.Role)))
            .ToList();

        return new AdminUserListResponse(rows, total, page, pageSize);
    }

    public async Task<AdminUserDetailResponse> GetUserByIdAsync(Guid id, CancellationToken ct = default)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Id == id, ct)
            ?? throw new NotFoundException("User", id);

        var member = await _db.FamilyMembers
            .Where(fm => fm.UserId == id)
            .Select(fm => new { fm.FamilyId, fm.Family.DisplayName, fm.Role })
            .FirstOrDefaultAsync(ct);

        var family = member is null
            ? null
            : new AdminUserFamilySummary(member.FamilyId, member.DisplayName, member.Role);

        return new AdminUserDetailResponse(
            user.Id,
            user.Email,
            user.DisplayName,
            user.Phone,
            user.Role,
            user.Status,
            user.EmailVerified,
            user.CreatedAt,
            user.UpdatedAt,
            user.LastLoginAt,
            family);
    }

    public async Task<AdminUserDetailResponse> UpdateUserStatusAsync(
        Guid id, UserStatus status, Guid adminId, CancellationToken ct = default)
    {
        if (id == adminId)
            throw new ForbiddenException("You cannot change the status of your own account.");

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Id == id, ct)
            ?? throw new NotFoundException("User", id);

        user.Status = status;
        await _db.SaveChangesAsync(ct);

        return await GetUserByIdAsync(id, ct);
    }

    public async Task<AdminUserDetailResponse> UpdateUserRoleAsync(
        Guid id, UserRole role, Guid adminId, CancellationToken ct = default)
    {
        if (id == adminId)
            throw new ForbiddenException("You cannot change your own role.");

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Id == id, ct)
            ?? throw new NotFoundException("User", id);

        user.Role = role;
        await _db.SaveChangesAsync(ct);

        return await GetUserByIdAsync(id, ct);
    }

    public async Task<TriggerPasswordResetResponse> TriggerPasswordResetAsync(
        Guid id, CancellationToken ct = default)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Id == id, ct)
            ?? throw new NotFoundException("User", id);

        // Cryptographically secure URL-safe token
        var tokenBytes = new byte[32];
        System.Security.Cryptography.RandomNumberGenerator.Fill(tokenBytes);
        var token = Convert.ToBase64String(tokenBytes)
            .Replace('+', '-').Replace('/', '_').TrimEnd('=');

        var expiresAt = DateTimeOffset.UtcNow.AddHours(24);
        user.PasswordResetToken    = token;
        user.PasswordResetExpiresAt = expiresAt;
        await _db.SaveChangesAsync(ct);

        return new TriggerPasswordResetResponse(token, expiresAt);
    }

    // ── Admin Internal Notes ───────────────────────────────────────────────

    public async Task<AdminNoteListResponse> GetAdminNotesAsync(
        Guid? familyId, Guid? bookingId, Guid? incidentId,
        int page, int pageSize, CancellationToken ct = default)
    {
        if (page < 1) page = 1;
        if (pageSize is < 1 or > 200) pageSize = 50;

        var query = _db.AdminNotes.AsNoTracking().AsQueryable();

        if (familyId.HasValue)
            query = query.Where(n => n.FamilyId == familyId.Value);
        if (bookingId.HasValue)
            query = query.Where(n => n.BookingId == bookingId.Value);
        if (incidentId.HasValue)
            query = query.Where(n => n.IncidentId == incidentId.Value);

        var total = await query.CountAsync(ct);

        var notes = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(n => n.Family)
            .Include(n => n.Booking)
            .Include(n => n.Incident)
            .ToListAsync(ct);

        var items = notes.Select(ToAdminNoteResponse).ToList();
        return new AdminNoteListResponse(items, total, page, pageSize);
    }

    public async Task<AdminNoteResponse> CreateAdminNoteAsync(
        CreateAdminNoteRequest request, Guid adminId, string adminEmail,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
            throw new AppException("Note content cannot be empty.");

        if (request.FamilyId is null && request.BookingId is null && request.IncidentId is null)
            throw new AppException("At least one of familyId, bookingId, or incidentId is required.");

        if (request.FamilyId.HasValue && !await _db.Families.AnyAsync(f => f.Id == request.FamilyId.Value, ct))
            throw new NotFoundException("Family", request.FamilyId.Value);

        if (request.BookingId.HasValue && !await _db.Bookings.AnyAsync(b => b.Id == request.BookingId.Value, ct))
            throw new NotFoundException("Booking", request.BookingId.Value);

        if (request.IncidentId.HasValue && !await _db.Incidents.AnyAsync(i => i.Id == request.IncidentId.Value, ct))
            throw new NotFoundException("Incident", request.IncidentId.Value);

        var note = new AdminNote
        {
            Content     = request.Content.Trim(),
            AuthorId    = adminId,
            AuthorEmail = adminEmail,
            FamilyId    = request.FamilyId,
            BookingId   = request.BookingId,
            IncidentId  = request.IncidentId,
        };

        _db.AdminNotes.Add(note);
        await _db.SaveChangesAsync(ct);

        // Re-read with navigation properties for label resolution
        var saved = await _db.AdminNotes.AsNoTracking()
            .Include(n => n.Family)
            .Include(n => n.Booking)
            .Include(n => n.Incident)
            .FirstAsync(n => n.Id == note.Id, ct);

        return ToAdminNoteResponse(saved);
    }

    private static AdminNoteResponse ToAdminNoteResponse(AdminNote n)
    {
        AdminNoteEntityType? entityType = null;
        Guid? entityId = null;
        string? entityLabel = null;

        if (n.FamilyId.HasValue)
        {
            entityType  = AdminNoteEntityType.Family;
            entityId    = n.FamilyId;
            entityLabel = n.Family?.DisplayName;
        }
        else if (n.BookingId.HasValue)
        {
            entityType  = AdminNoteEntityType.Booking;
            entityId    = n.BookingId;
            entityLabel = n.Booking is not null
                ? $"Booking #{n.BookingId.Value.ToString()[..8]}"
                : null;
        }
        else if (n.IncidentId.HasValue)
        {
            entityType  = AdminNoteEntityType.Incident;
            entityId    = n.IncidentId;
            entityLabel = n.Incident?.Summary;
        }

        return new AdminNoteResponse(
            n.Id, n.Content, n.AuthorId, n.AuthorEmail,
            entityType, entityId, entityLabel, n.CreatedAt);
    }
}
