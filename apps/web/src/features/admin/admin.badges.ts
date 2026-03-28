import type {
  BookingStatus,
  PaymentStatus,
  IncidentStatus,
  IncidentSeverity,
  IncidentType,
  ReportType,
} from './admin.types'

/** Human-readable labels for each booking status (handles `InProgress` → `In Progress`). */
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  Pending:    'Pending',
  Confirmed:  'Confirmed',
  InProgress: 'In Progress',
  Completed:  'Completed',
  Cancelled:  'Cancelled',
}

/** Returns the display label for a booking status. */
export function formatBookingStatus(status: BookingStatus): string {
  return BOOKING_STATUS_LABELS[status]
}

/** Pill colour classes for each booking status. */
export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  Pending:    'bg-gray-100 text-gray-600',
  Confirmed:  'bg-blue-100 text-blue-700',
  InProgress: 'bg-amber-100 text-amber-700',
  Cancelled:  'bg-red-100 text-red-700',
  Completed:  'bg-green-100 text-green-700',
}

/** Pill colour classes for each payment status. */
export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  Pending:  'bg-yellow-100 text-yellow-700',
  Paid:     'bg-green-100 text-green-700',
  Refunded: 'bg-blue-100 text-blue-700',
  Waived:   'bg-gray-100 text-gray-600',
}

/** Human-readable labels for each incident status (handles `InProgress` → `In Progress`). */
export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  Open:       'Open',
  InProgress: 'In Progress',
  Resolved:   'Resolved',
  Dismissed:  'Dismissed',
}

/** Returns the display label for an incident status. */
export function formatIncidentStatus(status: IncidentStatus): string {
  return INCIDENT_STATUS_LABELS[status]
}

/** Pill colour classes for each incident severity. */
export const INCIDENT_SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  Low:      'bg-green-100 text-green-700',
  Medium:   'bg-yellow-100 text-yellow-700',
  High:     'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
}

/** Pill colour classes for each incident status. */
export const INCIDENT_STATUS_COLORS: Record<IncidentStatus, string> = {
  Open:       'bg-red-100 text-red-700',
  InProgress: 'bg-amber-100 text-amber-700',
  Resolved:   'bg-green-100 text-green-700',
  Dismissed:  'bg-gray-100 text-gray-500',
}

/** Human-readable labels for each incident type. */
export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  PhishingAttempt:    'Phishing Attempt',
  PasswordCompromise: 'Password Compromise',
  DeviceLostOrStolen: 'Device Lost or Stolen',
  UnauthorisedAccess: 'Unauthorised Access',
  DataBreach:         'Data Breach',
  MalwareInfection:   'Malware Infection',
  ScamOrFraud:        'Scam or Fraud',
  IdentityTheft:      'Identity Theft',
  SocialEngineering:  'Social Engineering',
  Other:              'Other',
}

/** Human-readable labels for each report type. */
export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  Assessment: 'Assessment',
  Incident:   'Incident',
  FamilyReset: 'Family Reset',
  General:    'General',
}

/** Pill colour classes for each report type. */
export const REPORT_TYPE_COLORS: Record<ReportType, string> = {
  Assessment:  'bg-blue-50 text-blue-700 border-blue-200',
  Incident:    'bg-red-50 text-red-700 border-red-200',
  FamilyReset: 'bg-amber-50 text-amber-700 border-amber-200',
  General:     'bg-gray-100 text-gray-600 border-gray-200',
}
