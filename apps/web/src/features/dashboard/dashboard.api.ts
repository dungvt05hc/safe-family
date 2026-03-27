import { apiClient } from '@/lib/api-client'
import type {
  DashboardData,
  DashboardFamilySummary,
  DashboardRiskSummary,
  DashboardCounts,
  DashboardChecklistItem,
  DashboardRecentIncident,
  DashboardRecentBooking,
  RiskLevel,
} from './dashboard.types'

// ── Backend response shapes (match DashboardDtos.cs) ─────────────────────────

interface BackendFamilySummary {
  id:          string
  displayName: string
  countryCode: string
  timezone:    string
}

interface BackendRiskSummary {
  overallScore:   number | null
  riskLevel:      string | null
  lastAssessedAt: string | null
}

interface BackendCounts {
  members:               number
  accounts:              number
  devices:               number
  pendingChecklistItems: number
}

interface BackendChecklistItem {
  id:       string
  title:    string
  category: string
  priority: number
}

interface BackendRecentIncident {
  id:        string
  type:      string
  severity:  string
  status:    string
  summary:   string
  createdAt: string
}

interface BackendRecentBooking {
  id:               string
  packageName:      string
  channel:          string
  status:           string
  preferredStartAt: string
  createdAt:        string
}

interface BackendDashboardResponse {
  family:           BackendFamilySummary
  riskSummary:      BackendRiskSummary
  counts:           BackendCounts
  immediateActions: string[]
  topPendingItems:  BackendChecklistItem[]
  recentIncidents:  BackendRecentIncident[]
  recentBookings:   BackendRecentBooking[]
}

// ── Mapping ───────────────────────────────────────────────────────────────────

function toFamily(f: BackendFamilySummary): DashboardFamilySummary {
  return { id: f.id, displayName: f.displayName, countryCode: f.countryCode, timezone: f.timezone }
}

function toRiskSummary(r: BackendRiskSummary): DashboardRiskSummary {
  return {
    overallScore:   r.overallScore,
    riskLevel:      (r.riskLevel as RiskLevel) ?? null,
    lastAssessedAt: r.lastAssessedAt,
  }
}

function toCounts(c: BackendCounts): DashboardCounts {
  return {
    members:               c.members,
    accounts:              c.accounts,
    devices:               c.devices,
    pendingChecklistItems: c.pendingChecklistItems,
  }
}

function toChecklistItem(i: BackendChecklistItem): DashboardChecklistItem {
  return { id: i.id, title: i.title, category: i.category, priority: i.priority }
}

function toRecentIncident(i: BackendRecentIncident): DashboardRecentIncident {
  return { id: i.id, type: i.type, severity: i.severity, status: i.status, summary: i.summary, createdAt: i.createdAt }
}

function toRecentBooking(b: BackendRecentBooking): DashboardRecentBooking {
  return { id: b.id, packageName: b.packageName, channel: b.channel, status: b.status, preferredStartAt: b.preferredStartAt, createdAt: b.createdAt }
}

// ── API ───────────────────────────────────────────────────────────────────────

export const dashboardApi = {
  /** GET /api/dashboard — aggregated dashboard for the authenticated user's family. */
  getDashboard: (): Promise<DashboardData> =>
    apiClient.get<BackendDashboardResponse>('/api/dashboard').then((r) => ({
      family:           toFamily(r.family),
      riskSummary:      toRiskSummary(r.riskSummary),
      counts:           toCounts(r.counts),
      immediateActions: r.immediateActions,
      topPendingItems:  r.topPendingItems.map(toChecklistItem),
      recentIncidents:  r.recentIncidents.map(toRecentIncident),
      recentBookings:   r.recentBookings.map(toRecentBooking),
    })),
}
