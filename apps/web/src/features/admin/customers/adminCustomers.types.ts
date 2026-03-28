// Canonical definition lives in admin.types; re-exported so consumers can import from here.
import type { RiskLevel } from '../admin.types'
export type { RiskLevel }

/**
 * Operational summary for a single family, returned by
 * GET /api/admin/customers.
 */
export interface AdminCustomerRow {
  familyId: string
  familyName: string
  countryCode: string
  ownerEmail: string | null
  ownerDisplayName: string | null
  ownerPhone: string | null
  memberCount: number
  /** Risk level from the most recent assessment; null = no assessment taken. */
  latestRiskLevel: RiskLevel | null
  openIncidentCount: number
  pendingBookingCount: number
  /** Package name from the most recent booking; null = no bookings. */
  latestPlanType: string | null
  createdAt: string
}

export interface AdminCustomerListResponse {
  items: AdminCustomerRow[]
  total: number
  page: number
  pageSize: number
}

export interface AdminCustomerFilters {
  search: string
  riskLevel: RiskLevel | ''
  planType: string
  page: number
  pageSize: number
}
