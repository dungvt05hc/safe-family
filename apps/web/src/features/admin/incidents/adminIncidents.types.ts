import type { PagedResult, IncidentStatus, IncidentSeverity, IncidentType, ReportType } from '../admin.types'
export type { IncidentStatus, IncidentSeverity, IncidentType, ReportType }

// ── List row ──────────────────────────────────────────────────────────────────

export interface AdminIncidentRow {
  id: string
  familyId: string
  familyName: string
  type: IncidentType
  severity: IncidentSeverity
  status: IncidentStatus
  summary: string
  firstActionPlan: string | null
  createdAt: string
  updatedAt: string
  /** Id of the first report linked to this incident, if any. */
  relatedReportId: string | null
  /** Booking id from that related report, if any. */
  relatedBookingId: string | null
}

export type AdminIncidentListResponse = PagedResult<AdminIncidentRow>

// ── Detail ────────────────────────────────────────────────────────────────────

export interface AdminIncidentNoteInfo {
  noteId: string
  content: string
  authorId: string
  authorEmail: string
  createdAt: string
}

export interface AdminIncidentRelatedReport {
  reportId: string
  reportType: ReportType
  title: string
  bookingId: string | null
  generatedAt: string
}

export interface AdminIncidentDetail extends AdminIncidentRow {
  notes: AdminIncidentNoteInfo[]
  relatedReports: AdminIncidentRelatedReport[]
}

// ── Filter state ──────────────────────────────────────────────────────────────

export interface AdminIncidentFiltersState {
  search: string
  severity: IncidentSeverity | ''
  status: IncidentStatus | ''
  type: IncidentType | ''
  from: string
  to: string
  page: number
  pageSize: number
}

// ── Request bodies ────────────────────────────────────────────────────────────

export interface AddIncidentNoteRequest {
  content: string
}
