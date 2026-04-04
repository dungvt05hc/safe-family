import { useQuery } from '@tanstack/react-query'
import { bookingsService } from '../bookings.service'

export const bookingKeys = {
  packages:      ['service-packages'] as const,
  myBookings:    ['bookings', 'my'] as const,
  detail:        (id: string) => ['bookings', id] as const,
  summary:       ['bookings', 'summary'] as const,
  paymentOrders: (id: string) => ['bookings', id, 'payments'] as const,
  events:        (id: string) => ['bookings', id, 'events'] as const,
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

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.detail(id ?? ''),
    queryFn: () => bookingsService.getById(id!),
    enabled: !!id,
    refetchInterval: (query) =>
      query.state.data?.paymentStatus === 'Pending' ? 10_000 : false,
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
 * Polls every 10 s automatically while any order has Pending status.
 */
export function usePaymentOrders(bookingId: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.paymentOrders(bookingId ?? ''),
    queryFn: () => bookingsService.getPaymentOrders(bookingId!),
    enabled: !!bookingId,
    refetchInterval: (query) =>
      query.state.data?.some((o) => o.status === 'Pending') ? 10_000 : false,
  })
}

/** Chronological activity log for a booking. */
export function useBookingEvents(bookingId: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.events(bookingId ?? ''),
    queryFn: () => bookingsService.getEvents(bookingId!),
    enabled: !!bookingId,
    staleTime: 30_000,
  })
}

