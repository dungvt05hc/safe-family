import { apiClient } from '@/lib/api-client'
import type {
  AdminDashboard,
  AdminCustomer,
  AdminBooking,
  AdminIncident,
  PaymentStatus,
  IncidentStatus,
} from './admin.types'

export const adminService = {
  getDashboard: (): Promise<AdminDashboard> =>
    apiClient.get<AdminDashboard>('/api/admin/dashboard'),

  getCustomers: (): Promise<AdminCustomer[]> =>
    apiClient.get<AdminCustomer[]>('/api/admin/customers'),

  getBookings: (): Promise<AdminBooking[]> =>
    apiClient.get<AdminBooking[]>('/api/admin/bookings'),

  updateBookingStatus: (id: string, status: PaymentStatus): Promise<AdminBooking> =>
    apiClient.patch<AdminBooking>(`/api/admin/bookings/${id}/status`, { status }),

  getIncidents: (): Promise<AdminIncident[]> =>
    apiClient.get<AdminIncident[]>('/api/admin/incidents'),

  updateIncidentStatus: (id: string, status: IncidentStatus): Promise<AdminIncident> =>
    apiClient.patch<AdminIncident>(`/api/admin/incidents/${id}/status`, { status }),
}
