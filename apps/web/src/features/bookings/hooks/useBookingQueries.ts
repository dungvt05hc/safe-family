import { useQuery } from '@tanstack/react-query'
import { bookingsService } from '../bookings.service'

export const bookingKeys = {
  packages: ['service-packages'] as const,
  myBookings: ['bookings', 'my'] as const,
  detail: (id: string) => ['bookings', id] as const,
  summary: ['bookings', 'summary'] as const,
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
  })
}

export function useBookingSummary() {
  return useQuery({
    queryKey: bookingKeys.summary,
    queryFn: () => bookingsService.getSummary(),
  })
}

