import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/types/api'
import { dashboardApi } from './dashboard.api'

// ── Query keys ────────────────────────────────────────────────────────────────

export const DASHBOARD_KEY = ['dashboard'] as const

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Fetches the aggregated dashboard data for the authenticated user's family.
 * Returns an ApiError with status 403 if the user does not belong to a family yet.
 */
export function useDashboard() {
  return useQuery({
    queryKey:  DASHBOARD_KEY,
    queryFn:   dashboardApi.getDashboard,
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.isForbidden || error.isNotFound)) return false
      return failureCount < 2
    },
  })
}
