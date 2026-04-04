/** Generic paginated response shape shared across all list endpoints. */
export interface PagedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export type IncidentStatus   = 'Open' | 'InProgress' | 'Resolved' | 'Dismissed'
export type IncidentType     = 'PhishingAttempt' | 'PasswordCompromise' | 'DeviceLostOrStolen' | 'UnauthorisedAccess' | 'DataBreach' | 'MalwareInfection' | 'ScamOrFraud' | 'IdentityTheft' | 'SocialEngineering' | 'Other'
export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical'
export type PaymentStatus    = 'Unpaid' | 'Pending' | 'Paid' | 'Failed' | 'Expired' | 'Refunded' | 'PartiallyRefunded'
export type BookingStatus    = 'Draft' | 'Submitted' | 'Paid' | 'Confirmed' | 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled' | 'Expired'
export type BookingChannel   = 'Online' | 'Phone' | 'Email' | 'Onsite'
export type BookingSource    = 'Direct' | 'IncidentFollowUp' | 'AssessmentFollowUp' | 'AdminCreated'
export type RiskLevel        = 'Low' | 'Medium' | 'High' | 'Critical'

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardBookingRow {
  id: string
  familyName: string
  packageName: string
  status: BookingStatus
  paymentStatus: PaymentStatus
  preferredStartAt: string
  createdAt: string
}

export interface DashboardIncidentRow {
  id: string
  familyName: string
  type: IncidentType
  severity: IncidentSeverity
  status: IncidentStatus
  summary: string
  createdAt: string
}

export interface AdminDashboard {
  totalUsers: number
  totalFamilies: number
  totalMembers: number
  totalBookings: number
  totalIncidents: number
  totalReports: number
  openIncidents: number
  pendingBookings: number
  highRiskFamilies: number
  recentBookings: DashboardBookingRow[]
  recentIncidents: DashboardIncidentRow[]
  recentAuditLogs: AuditLogEntry[]
}


export interface AuditLogEntry {
  id: string
  action: string
  userId: string | null
  userEmail: string | null
  entityType: string | null
  entityId: string | null
  details: string | null
  createdAt: string
}

export type AuditLogPage = PagedResult<AuditLogEntry>

// ── Reports ───────────────────────────────────────────────────────────────────

export type ReportType = 'Assessment' | 'Incident' | 'FamilyReset' | 'General'

export interface AdminReport {
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

export type AdminReportPage = PagedResult<AdminReport>

// ── Service Packages ──────────────────────────────────────────────────────────

export type { AdminServicePackage } from './servicePackages/adminServicePackages.types'
