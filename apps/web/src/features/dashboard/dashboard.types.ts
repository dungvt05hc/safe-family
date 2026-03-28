// ── Family summary ────────────────────────────────────────────────────────────

export interface DashboardFamilySummary {
  id:          string
  displayName: string
  countryCode: string
  timezone:    string
}

// ── Risk summary ──────────────────────────────────────────────────────────────

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical'

export interface DashboardRiskSummary {
  overallScore:   number | null
  riskLevel:      RiskLevel | null
  lastAssessedAt: string | null   // ISO-8601
}

// ── Counts ────────────────────────────────────────────────────────────────────

export interface DashboardCounts {
  members:               number
  accounts:              number
  devices:               number
  pendingChecklistItems: number
  activeIncidents:       number
}

// ── Checklist items ───────────────────────────────────────────────────────────

export interface DashboardChecklistItem {
  id:       string
  title:    string
  category: string
  priority: number
}

// ── Recent incidents ──────────────────────────────────────────────────────────

export interface DashboardRecentIncident {
  id:        string
  type:      string
  severity:  string
  status:    string
  summary:   string
  createdAt: string  // ISO-8601
}

// ── Recent bookings ───────────────────────────────────────────────────────────

export interface DashboardRecentBooking {
  id:               string
  packageName:      string
  channel:          string
  status:           string
  preferredStartAt: string  // ISO-8601
  createdAt:        string  // ISO-8601
}

// ── Aggregate dashboard ───────────────────────────────────────────────────────

export interface DashboardData {
  family:           DashboardFamilySummary
  riskSummary:      DashboardRiskSummary
  counts:           DashboardCounts
  immediateActions: string[]
  topPendingItems:  DashboardChecklistItem[]
  recentIncidents:  DashboardRecentIncident[]
  recentBookings:   DashboardRecentBooking[]
}
