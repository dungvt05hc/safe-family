import { useQuery } from '@tanstack/react-query'
import { adminService } from '../admin.service'

export const adminKeys = {
  dashboard:       ['admin', 'dashboard'] as const,
  auditLogs:       (page: number) => ['admin', 'audit-logs', page] as const,
  reports:         (page: number) => ['admin', 'reports', page] as const,
  servicePackages: ['admin', 'packages'] as const,
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminKeys.dashboard,
    queryFn: adminService.getDashboard,
  })
}

export function useAdminAuditLogs(page = 1) {
  return useQuery({
    queryKey: adminKeys.auditLogs(page),
    queryFn: () => adminService.getAuditLogs(page),
  })
}

export function useAdminReports(page = 1) {
  return useQuery({
    queryKey: adminKeys.reports(page),
    queryFn: () => adminService.getReports(page),
  })
}

export function useAdminServicePackages() {
  return useQuery({
    queryKey: adminKeys.servicePackages,
    queryFn: adminService.getServicePackages,
  })
}
