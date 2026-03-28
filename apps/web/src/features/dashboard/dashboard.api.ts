import { apiClient } from '@/lib/api-client'
import type { DashboardData, RiskLevel } from './dashboard.types'

/**
 * Wire shape from GET /api/dashboard.
 * Structurally identical to DashboardData except riskSummary.riskLevel arrives
 * as a raw string (backend enum serialised to string by ASP.NET Core).
 */
interface BackendDashboardResponse extends Omit<DashboardData, 'riskSummary'> {
  riskSummary: {
    overallScore:   number | null
    riskLevel:      string | null
    lastAssessedAt: string | null
  }
}

export const dashboardApi = {
  /** GET /api/dashboard — aggregated dashboard for the authenticated user's family. */
  getDashboard: (): Promise<DashboardData> =>
    apiClient.get<BackendDashboardResponse>('/api/dashboard').then((r) => ({
      ...r,
      riskSummary: {
        ...r.riskSummary,
        riskLevel: r.riskSummary.riskLevel as RiskLevel | null,
      },
    })),
}
