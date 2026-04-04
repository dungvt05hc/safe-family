import { useQuery } from '@tanstack/react-query'
import { bookingsService } from '../bookings.service'

export const bookingKeys = {
  packages:      ['service-packages'] as const,
  myBookings:    ['bookings', 'my'] as const,
  detail:        (id: string) => ['bookings', id] as const,
  summary:       ['bookings', 'summary'] as const,
  paymentOrders: (id: string) => ['bookings', id, 'payments'] as const,
}

export function useServicePackages() {
  return useQuery({
    queryKey: bookingKeys.packages,
    queryFn: () => bookingsService.getServicePackages(),
  })
}

export function useMyBookings() {
  return useQuery({
    queryKey: bookingKeys.myBookings,
    queryFn: () => bookingsService.getMyBookings(),
  })
}

export function useBooking(id: string | undefined, pollWhilePending = false) {
  return useQuery({
    queryKey: bookingKeys.detail(id ?? ''),
    queryFn: () => bookingsService.getById(id!),
    enabled: !!id,
    refetchInterval: pollWhilePending ? 10_000 : false,
  })
}

export function useBookingSummary() {
  return useQuery({
    queryKey: bookingKeys.summary,
    queryFn: () => bookingsService.getSummary(),
  })
}

/**
 * Fetches payment orders for a booking.
 * Polls every 10 s when `pollWhilePending` is true (i.e. paymentStatus === 'Pending').
 */
export function usePaymentOrders(bookingId: string | undefined, pollWhilePending = false) {
  return useQuery({
    queryKey: bookingKeys.paymentOrders(bookingId ?? ''),
    queryFn: () => bookingsService.getPaymentOrders(bookingId!),
    enabled: !!bookingId,
    refetchInterval: pollWhilePending ? 10_000 : false,
  })
}

