import type { BadgeVariant } from '@/components/ui'

// ── Core types ────────────────────────────────────────────────────────────────

export type ReportType = 'Assessment' | 'Incident' | 'FamilyReset'

export interface Report {
  id:          string
  type:        ReportType
  title:       string
  description: string
  generatedAt: string        // ISO-8601
  /** Context label, e.g. incident type or booking package name */
  contextLabel?: string
  /** Downloadable asset URL — null if not yet generated */
  downloadUrl?: string | null
  /** Rich markdown / plain-text body shown in the preview panel */
  body:        string
  /** Linked booking ID for context */
  bookingId?:  string | null
  /** Linked incident ID for context */
  incidentId?: string | null
}

export interface ReportSummary {
  totalReports:       number
  assessmentReports:  number
  incidentReports:    number
  familyResetReports: number
  latestGeneratedAt?: string | null
}

// ── Filter types ──────────────────────────────────────────────────────────────

export type ReportTypeFilter = 'All' | ReportType

export interface ReportFilters {
  search:    string
  type:      ReportTypeFilter
  /** Lower bound ISO date string, '' = no lower bound */
  dateFrom:  string
  /** Upper bound ISO date string, '' = no upper bound */
  dateTo:    string
}

export const DEFAULT_REPORT_FILTERS: ReportFilters = {
  search:   '',
  type:     'All',
  dateFrom: '',
  dateTo:   '',
}

// ── Display helpers ───────────────────────────────────────────────────────────

export const REPORT_TYPE_LABEL: Record<ReportType, string> = {
  Assessment:  'Assessment',
  Incident:    'Incident',
  FamilyReset: 'Family Reset',
}

export const REPORT_TYPE_BADGE: Record<ReportType, BadgeVariant> = {
  Assessment:  'info',
  Incident:    'danger',
  FamilyReset: 'success',
}

export const REPORT_TYPE_FILTER_OPTIONS: { value: ReportTypeFilter; label: string }[] = [
  { value: 'All',         label: 'All types' },
  { value: 'Assessment',  label: 'Assessment' },
  { value: 'Incident',    label: 'Incident' },
  { value: 'FamilyReset', label: 'Family Reset' },
]
