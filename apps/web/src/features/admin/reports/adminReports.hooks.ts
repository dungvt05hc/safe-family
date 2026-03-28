import { useQuery } from '@tanstack/react-query'
import { adminReportsApi } from './adminReports.api'
import type { AdminReportFiltersState } from './adminReports.types'

// ── Query key factory ─────────────────────────────────────────────────────────

export const adminReportKeys = {
  all:    ()                                   => ['admin', 'reports'] as const,
  list:   (filters: AdminReportFiltersState)   => ['admin', 'reports', 'list', filters] as const,
  detail: (id: string)                         => ['admin', 'reports', 'detail', id] as const,
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function useAdminReportsList(filters: AdminReportFiltersState) {
  return useQuery({
    queryKey: adminReportKeys.list(filters),
    queryFn: () => adminReportsApi.getReports(filters),
    placeholderData: (prev) => prev,
  })
}

export function useAdminReportDetail(id: string | null) {
  return useQuery({
    queryKey: adminReportKeys.detail(id ?? ''),
    queryFn: () => adminReportsApi.getReportById(id!),
    enabled: !!id,
    staleTime: 30_000,
  })
}
