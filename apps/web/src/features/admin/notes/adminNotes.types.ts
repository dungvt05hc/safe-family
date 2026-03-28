// ── Response types (mirror backend DTOs) ──────────────────────────────────────

export type AdminNoteEntityType = 'Family' | 'Booking' | 'Incident'

export interface AdminNoteResponse {
  id: string
  content: string
  authorId: string
  authorEmail: string
  entityType: AdminNoteEntityType | null
  entityId: string | null
  entityLabel: string | null
  createdAt: string
}

export interface AdminNoteListResponse {
  items: AdminNoteResponse[]
  total: number
  page: number
  pageSize: number
}

// ── Request types ─────────────────────────────────────────────────────────────

export interface CreateAdminNoteRequest {
  content: string
  familyId?: string
  bookingId?: string
  incidentId?: string
}

// ── Filter state ──────────────────────────────────────────────────────────────

export interface AdminNotesFilters {
  familyId?: string
  bookingId?: string
  incidentId?: string
  page: number
  pageSize: number
}

// ── Shared utilities ──────────────────────────────────────────────────────────

export function formatNoteDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export const NOTE_ENTITY_TYPE_COLORS: Record<AdminNoteEntityType, string> = {
  Family:   'bg-blue-100 text-blue-700',
  Booking:  'bg-amber-100 text-amber-700',
  Incident: 'bg-red-100 text-red-700',
}
