import type { UserRole } from '@/features/auth/auth.types'

export interface AdminDashboard {
  totalUsers: number
  totalFamilies: number
  totalBookings: number
  totalIncidents: number
  openIncidents: number
  pendingBookings: number
  recentAuditLogs: AuditLogEntry[]
}

export interface AdminCustomer {
  id: string
  email: string
  displayName: string
  role: UserRole
  familyCount: number
  createdAt: string
}

export type IncidentStatus = 'Open' | 'InProgress' | 'Resolved' | 'Dismissed'
export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded' | 'Waived'

export interface AdminBooking {
  id: string
  familyId: string
  familyName: string
  packageId: string
  packageName: string
  preferredStartAt: string
  channel: string
  notes: string | null
  paymentStatus: PaymentStatus
  createdAt: string
}

export interface AdminIncident {
  id: string
  familyId: string
  familyName: string
  type: string
  severity: string
  status: IncidentStatus
  summary: string
  createdAt: string
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
