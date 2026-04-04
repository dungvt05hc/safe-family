// Re-export shared types from the canonical admin.types module.
import type { PagedResult, BookingStatus, BookingChannel, PaymentStatus, BookingSource } from '../admin.types'
export type { BookingStatus, BookingChannel, PaymentStatus, BookingSource }

// ── Quick filter ──────────────────────────────────────────────────────────────

/**
 * Maps to predefined (BookingStatus × PaymentStatus) combinations on the server.
 * Matches the backend BookingQuickFilter enum.
 */
export type BookingQuickFilter =
  | 'PendingPayment'
  | 'PaidNotConfirmed'
  | 'Confirmed'
  | 'Scheduled'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled'
  | 'Expired'

// ── Payment summary (embedded in list row) ────────────────────────────────────

export interface AdminBookingPaymentSummary {
  orderId: string
  amount: number
  currency: string
  status: PaymentStatus
  gatewayProvider: string | null
  paidAt: string | null
  expiresAt: string | null
  createdAt: string
}

// ── Payment order detail (full; included in detail response) ──────────────────

export interface AdminBookingPaymentOrderInfo {
  orderId: string
  amount: number
  currency: string
  status: PaymentStatus
  gatewayProvider: string | null
  gatewayOrderId: string | null
  gatewayTransactionId: string | null
  paymentUrl: string | null
  qrCodeUrl: string | null
  paidAt: string | null
  expiresAt: string | null
  failedAt: string | null
  refundedAt: string | null
  refundedAmount: number | null
  createdAt: string
}

// ── Booking event (audit trail) ───────────────────────────────────────────────

export interface AdminBookingEventInfo {
  eventId: string
  eventType: string
  fromValue: string | null
  toValue: string | null
  description: string | null
  actorId: string | null
  actorEmail: string | null
  createdAt: string
}

// ── List row (returned by GET /api/admin/bookings) ────────────────────────────

export interface AdminBookingRow {
  id: string
  familyId: string
  familyName: string
  packageId: string
  packageName: string
  // Snapshot
  snapshotPackageCode: string
  snapshotPrice: number
  snapshotCurrency: string
  snapshotDurationMinutes: number
  // Scheduling
  preferredStartAt: string
  confirmedStartAt: string | null
  confirmedEndAt: string | null
  // Channel & origin
  channel: BookingChannel
  source: BookingSource
  sourceIncidentId: string | null
  sourceAssessmentId: string | null
  // Notes & status
  customerNotes: string | null
  status: BookingStatus
  paymentStatus: PaymentStatus
  expiresAt: string | null
  // Assignment
  assignedAdminUserId: string | null
  assignedAdminEmail: string | null
  // Payment summary (latest order)
  latestPayment: AdminBookingPaymentSummary | null
  // Timestamps
  createdAt: string
  updatedAt: string
}

// Relies on the generic PagedResult shape from admin.types.
export type AdminBookingListResponse = PagedResult<AdminBookingRow>

// ── Detail (GET /api/admin/bookings/{id}) ─────────────────────────────────────

export interface AdminBookingNoteInfo {
  noteId: string
  content: string
  authorId: string
  authorEmail: string
  createdAt: string
}

export type ReportType = 'Assessment' | 'Incident' | 'FamilyReset' | 'General'

export interface AdminBookingReportInfo {
  reportId: string
  reportType: ReportType
  title: string
  description: string
  fileUrl: string | null
  generatedAt: string
}

export interface AdminBookingDetail extends AdminBookingRow {
  // Resolved source entity names
  sourceIncidentSummary: string | null
  sourceAssessmentDate: string | null
  // Extended fields only present in detail (not list row)
  internalNotes: string | null
  // Collections
  paymentOrders: AdminBookingPaymentOrderInfo[]
  events: AdminBookingEventInfo[]
  bookingNotes: AdminBookingNoteInfo[]
  relatedReports: AdminBookingReportInfo[]
}

// ── Filter state ──────────────────────────────────────────────────────────────

export interface AdminBookingFilters {
  search: string
  quickFilter: BookingQuickFilter | ''
  status: BookingStatus | ''
  paymentStatus: PaymentStatus | ''
  channel: BookingChannel | ''
  source: BookingSource | ''
  packageId: string
  from: string
  to: string
  page: number
  pageSize: number
}

// ── Request bodies ────────────────────────────────────────────────────────────

export interface AssignBookingRequest {
  assignedAdminUserId: string | null
  assignedAdminEmail: string | null
}

export interface AddBookingNoteRequest {
  content: string
}

export interface LinkBookingReportRequest {
  reportId: string | null
}


