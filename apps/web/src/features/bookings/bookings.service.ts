import { apiClient } from '@/lib/api-client'
import type { BookingResult, BookingSummary, CreateBookingRequest, ServicePackage } from './bookings.types'

export const bookingsService = {
  getServicePackages: (): Promise<ServicePackage[]> =>
    apiClient.get('/api/service-packages'),

  create: (data: CreateBookingRequest): Promise<BookingResult> =>
    apiClient.post('/api/bookings', data),

  getMyBookings: (): Promise<BookingResult[]> =>
    apiClient.get('/api/bookings/my'),

  getById: (id: string): Promise<BookingResult> =>
    apiClient.get(`/api/bookings/${id}`),

  getSummary: (): Promise<BookingSummary> =>
    apiClient.get('/api/bookings/summary'),
}

