import { apiClient } from '@/lib/api-client'
import type {
  AdminReportFiltersState,
  AdminReportListResponse,
  AdminReportDetail,
} from './adminReports.types'

function buildQuery(f: AdminReportFiltersState): string {
  const params = new URLSearchParams()
  if (f.search)     params.set('search', f.search)
  if (f.reportType) params.set('reportType', f.reportType)
  if (f.from)       params.set('from', f.from)
  if (f.to)         params.set('to', f.to)
  params.set('page', String(f.page))
  params.set('pageSize', String(f.pageSize))
  return params.toString()
}

export const adminReportsApi = {
  getReports: (filters: AdminReportFiltersState): Promise<AdminReportListResponse> => {
    const qs = buildQuery(filters)
    return apiClient.get<AdminReportListResponse>(`/api/admin/reports?${qs}`)
  },

  getFamilyReports: (familyId: string): Promise<AdminReportListResponse> =>
    apiClient.get<AdminReportListResponse>(`/api/admin/reports?familyId=${encodeURIComponent(familyId)}&pageSize=50`),

  getReportById: (id: string): Promise<AdminReportDetail> =>
    apiClient.get<AdminReportDetail>(`/api/admin/reports/${id}`),

  /** Returns the server-side download redirect URL for use in an <a> tag. */
  downloadUrl: (id: string): string => `/api/admin/reports/${id}/download`,
}
