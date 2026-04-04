import { apiClient } from '@/lib/api-client'
import type {
  BookingResult,
  BookingEventResponse,
  BookingSummary,
  CreateBookingRequest,
  PaymentInitiateResponse,
  PaymentOrder,
  ServicePackage,
} from './bookings.types'

export const bookingsService = {
  getServicePackages: (): Promise<ServicePackage[]> =>
    apiClient.get('/api/service-packages'),

  /** Create a draft booking then immediately submit it (single UX action). */
  createAndSubmit: async (data: CreateBookingRequest): Promise<BookingResult> => {
    const booking = await apiClient.post<BookingResult>('/api/bookings', data)
    return apiClient.post<BookingResult>(`/api/bookings/${booking.id}/submit`)
  },

  submit: (id: string): Promise<BookingResult> =>
    apiClient.post(`/api/bookings/${id}/submit`),

  getMyBookings: (): Promise<BookingResult[]> =>
    apiClient.get('/api/bookings/my'),

  getById: (id: string): Promise<BookingResult> =>
    apiClient.get(`/api/bookings/${id}`),

  getSummary: (): Promise<BookingSummary> =>
    apiClient.get('/api/bookings/summary'),

  // ── Payment ───────────────────────────────────────────────────────────────

  /** First-time payment initiation (booking must be Submitted + Unpaid). */
  initiatePayment: (bookingId: string): Promise<PaymentInitiateResponse> =>
    apiClient.post(`/api/bookings/${bookingId}/payment/initiate`),

  /** Retry after a Failed or Expired payment order. */
  retryPayment: (bookingId: string): Promise<PaymentInitiateResponse> =>
    apiClient.post(`/api/bookings/${bookingId}/payment/retry`),

  /** Full payment history for a booking. */
  getPaymentOrders: (bookingId: string): Promise<PaymentOrder[]> =>
    apiClient.get(`/api/bookings/${bookingId}/payments`),

  /** Chronological activity log for a booking. */
  getEvents: (bookingId: string): Promise<BookingEventResponse[]> =>
    apiClient.get(`/api/bookings/${bookingId}/events`),
}

