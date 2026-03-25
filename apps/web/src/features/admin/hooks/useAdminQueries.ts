import { useQuery } from '@tanstack/react-query'
import { adminService } from '../admin.service'

export const adminKeys = {
  dashboard: ['admin', 'dashboard'] as const,
  customers: ['admin', 'customers'] as const,
  bookings: ['admin', 'bookings'] as const,
  incidents: ['admin', 'incidents'] as const,
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminKeys.dashboard,
    queryFn: adminService.getDashboard,
  })
}

export function useAdminCustomers() {
  return useQuery({
    queryKey: adminKeys.customers,
    queryFn: adminService.getCustomers,
  })
}

export function useAdminBookings() {
  return useQuery({
    queryKey: adminKeys.bookings,
    queryFn: adminService.getBookings,
  })
}

export function useAdminIncidents() {
  return useQuery({
    queryKey: adminKeys.incidents,
    queryFn: adminService.getIncidents,
  })
}
