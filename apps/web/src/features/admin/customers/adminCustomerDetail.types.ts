// Re-export shared types from canonical locations — never redefine here.
import type { RiskLevel, IncidentType, IncidentSeverity, IncidentStatus, BookingChannel, BookingStatus, PaymentStatus, ReportType } from '../admin.types'
import type { UserStatus, FamilyMemberRole } from '../users/adminUsers.types'

export type { RiskLevel, IncidentType, IncidentSeverity, IncidentStatus, BookingChannel, BookingStatus, PaymentStatus, ReportType }
export type { UserStatus, FamilyMemberRole }

// ── Domain enum types that only appear in this feature ───────────────────────

export type AccountType =
  | 'Email' | 'SocialMedia' | 'Banking' | 'Shopping' | 'Streaming'
  | 'Gaming' | 'Government' | 'Healthcare' | 'Insurance' | 'Utility'
  | 'Work' | 'Other'

export type TwoFactorStatus = 'Unknown' | 'Enabled' | 'Disabled'
export type RecoveryStatus  = 'Unknown' | 'Set' | 'NotSet'

export type DeviceType =
  | 'Smartphone' | 'Tablet' | 'Laptop' | 'Desktop'
  | 'SmartWatch' | 'SmartTV' | 'GameConsole' | 'Other'

export type SupportStatus = 'Unknown' | 'Supported' | 'EndOfLife' | 'NoLongerReceivingUpdates'

// ── Sub-response shapes ───────────────────────────────────────────────────────

export interface AdminCustomerOwnerInfo {
  userId: string
  email: string
  displayName: string
  phone: string | null
  status: UserStatus
  emailVerified: boolean
  lastLoginAt: string | null
}

export interface AdminCustomerMemberInfo {
  userId: string
  email: string
  displayName: string
  role: FamilyMemberRole
  status: UserStatus
  joinedAt: string
}

export interface AdminCustomerAccountInfo {
  accountId: string
  accountType: AccountType
  maskedIdentifier: string
  twoFactorStatus: TwoFactorStatus
  recoveryEmailStatus: RecoveryStatus
  recoveryPhoneStatus: RecoveryStatus
  suspiciousActivityFlag: boolean
  notes: string | null
  createdAt: string
}

export interface AdminCustomerDeviceInfo {
  deviceId: string
  deviceType: DeviceType
  brand: string
  model: string
  osName: string
  osVersion: string
  supportStatus: SupportStatus
  screenLockEnabled: boolean
  biometricEnabled: boolean
  backupEnabled: boolean
  findMyDeviceEnabled: boolean
  notes: string | null
  createdAt: string
}

export interface AdminCustomerAssessmentInfo {
  assessmentId: string
  overallScore: number
  accountSecurityScore: number
  deviceHygieneScore: number
  backupRecoveryScore: number
  privacySharingScore: number
  scamReadinessScore: number
  riskLevel: RiskLevel
  completedAt: string
}

export interface AdminCustomerChecklistSummary {
  total: number
  pending: number
  completed: number
  dismissed: number
  inProgress: number
}

export interface AdminCustomerIncidentInfo {
  incidentId: string
  type: IncidentType
  severity: IncidentSeverity
  status: IncidentStatus
  summary: string
  createdAt: string
}

export interface AdminCustomerBookingInfo {
  bookingId: string
  packageId: string
  packageName: string
  preferredStartAt: string
  channel: BookingChannel
  status: BookingStatus
  paymentStatus: PaymentStatus
  notes: string | null
  createdAt: string
}

export interface AdminCustomerReportInfo {
  reportId: string
  reportType: ReportType
  title: string
  description: string
  fileUrl: string | null
  bookingId: string | null
  incidentId: string | null
  generatedAt: string
}

export interface AdminCustomerNoteInfo {
  noteId: string
  content: string
  authorId: string
  authorEmail: string
  createdAt: string
}

// ── Root response ─────────────────────────────────────────────────────────────

export interface AdminCustomerDetailResponse {
  familyId: string
  familyName: string
  countryCode: string
  timezone: string
  createdAt: string
  owner: AdminCustomerOwnerInfo | null
  members: AdminCustomerMemberInfo[]
  accounts: AdminCustomerAccountInfo[]
  devices: AdminCustomerDeviceInfo[]
  latestAssessment: AdminCustomerAssessmentInfo | null
  checklistSummary: AdminCustomerChecklistSummary
  incidents: AdminCustomerIncidentInfo[]
  bookings: AdminCustomerBookingInfo[]
  reports: AdminCustomerReportInfo[]
  notes: AdminCustomerNoteInfo[]
}

// ── Request shapes ────────────────────────────────────────────────────────────

export interface AddCustomerNoteRequest {
  /** Must be 1–2000 non-whitespace characters. Enforced on both client and server. */
  content: string
}
