import type { PagedResult, ReportType, IncidentType, IncidentSeverity, IncidentStatus, BookingStatus } from '../admin.types'

export type { ReportType }

// ── Row returned by the list endpoint ──────────────────────────────────────────

export interface AdminReportRow {
  id: string
  familyId: string
  familyName: string
  bookingId: string | null
  incidentId: string | null
  reportType: ReportType
  title: string
  description: string
  fileUrl: string | null
  generatedAt: string
}

export type AdminReportListResponse = PagedResult<AdminReportRow>

// ── Linked context shapes returned by the detail endpoint ─────────────────────

export interface ReportLinkedIncident {
  id: string
  type: IncidentType
  severity: IncidentSeverity
  status: IncidentStatus
  summary: string
}

export interface ReportLinkedBooking {
  id: string
  packageName: string
  status: BookingStatus
  createdAt: string
}

// ── Full detail returned by GET /api/admin/reports/{id} ───────────────────────

export interface AdminReportDetail extends AdminReportRow {
  linkedIncident: ReportLinkedIncident | null
  linkedBooking: ReportLinkedBooking | null
}

// ── Filters ──────────────────────────────────────────────────────────────────

export interface AdminReportFiltersState {
  search: string
  reportType: ReportType | ''
  from: string
  to: string
  page: number
  pageSize: number
}
