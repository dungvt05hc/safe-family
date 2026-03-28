import { apiClient } from '@/lib/api-client'
import type {
  AdminDashboard,
  AdminReportPage,
  AuditLogPage,
} from './admin.types'
import { adminServicePackagesApi } from './servicePackages/adminServicePackages.api'

export const adminService = {
  getDashboard: (): Promise<AdminDashboard> =>
    apiClient.get<AdminDashboard>('/api/admin/dashboard'),

  getAuditLogs: (page = 1, pageSize = 50): Promise<AuditLogPage> =>
    apiClient.get<AuditLogPage>(`/api/admin/audit-logs?page=${page}&pageSize=${pageSize}`),

  // ── Reports ────────────────────────────────────────────────────────────────

  getReports: (page = 1, pageSize = 25): Promise<AdminReportPage> =>
    apiClient.get<AdminReportPage>(`/api/admin/reports?page=${page}&pageSize=${pageSize}`),

  // ── Service Packages ───────────────────────────────────────────────────────

  getServicePackages: () => adminServicePackagesApi.list(),
}
