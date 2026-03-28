// Re-export shared types from the canonical admin.types module.
import type { PagedResult, BookingStatus, BookingChannel, PaymentStatus } from '../admin.types'
export type { BookingStatus, BookingChannel, PaymentStatus }

// ── List row (index) ──────────────────────────────────────────────────────────

export interface AdminBookingRow {
  id: string
  familyId: string
  familyName: string
  packageId: string
  packageName: string
  preferredStartAt: string
  channel: BookingChannel
  notes: string | null
  status: BookingStatus
  paymentStatus: PaymentStatus
  assignedAdminId: string | null
  assignedAdminEmail: string | null
  createdAt: string
  updatedAt: string
}

// Relies on the generic PagedResult shape from admin.types.
export type AdminBookingListResponse = PagedResult<AdminBookingRow>

// ── Detail (single booking with notes) ───────────────────────────────────────

export interface AdminBookingNoteInfo {
  noteId: string
  content: string
  authorId: string
  authorEmail: string
  createdAt: string
}

export interface AdminBookingDetail extends AdminBookingRow {
  bookingNotes: AdminBookingNoteInfo[]
}

// ── Filter state ──────────────────────────────────────────────────────────────

export interface AdminBookingFilters {
  search: string
  status: BookingStatus | ''
  channel: BookingChannel | ''
  packageId: string
  from: string
  to: string
  page: number
  pageSize: number
}

// ── Request bodies ────────────────────────────────────────────────────────────

export interface AssignBookingRequest {
  assignedAdminId: string | null
  assignedAdminEmail: string | null
}

export interface AddBookingNoteRequest {
  content: string
}


