import { apiClient } from '@/lib/api-client'
import type {
  AdminBookingFilters,
  AdminBookingListResponse,
  AdminBookingDetail,
  AdminBookingRow,
  AdminBookingNoteInfo,
  AssignBookingRequest,
  AddBookingNoteRequest,
  BookingStatus,
  PaymentStatus,
} from './adminBookings.types'

function buildQuery(filters: AdminBookingFilters): string {
  const params = new URLSearchParams()
  if (filters.search)        params.set('search', filters.search)
  if (filters.quickFilter)   params.set('quickFilter', filters.quickFilter)
  if (filters.status)        params.set('status', filters.status)
  if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus)
  if (filters.channel)       params.set('channel', filters.channel)
  if (filters.source)        params.set('source', filters.source)
  if (filters.packageId)     params.set('packageId', filters.packageId)
  if (filters.from)          params.set('from', filters.from)
  if (filters.to)            params.set('to', filters.to)
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))
  return params.toString()
}

export const adminBookingsApi = {
  getBookings: (filters: AdminBookingFilters): Promise<AdminBookingListResponse> => {
    const qs = buildQuery(filters)
    return apiClient.get<AdminBookingListResponse>(`/api/admin/bookings?${qs}`)
  },

  getBookingById: (id: string): Promise<AdminBookingDetail> =>
    apiClient.get<AdminBookingDetail>(`/api/admin/bookings/${id}`),

  updateStatus: (id: string, status: BookingStatus): Promise<AdminBookingRow> =>
    apiClient.patch<AdminBookingRow>(`/api/admin/bookings/${id}/status`, { status }),

  updatePaymentStatus: (id: string, status: PaymentStatus): Promise<AdminBookingRow> =>
    apiClient.patch<AdminBookingRow>(`/api/admin/bookings/${id}/payment-status`, { status }),

  assign: (id: string, req: AssignBookingRequest): Promise<AdminBookingRow> =>
    apiClient.patch<AdminBookingRow>(`/api/admin/bookings/${id}/assign`, req),

  addNote: (id: string, req: AddBookingNoteRequest): Promise<AdminBookingNoteInfo> =>
    apiClient.post<AdminBookingNoteInfo>(`/api/admin/bookings/${id}/notes`, req),
}
