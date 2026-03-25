import { useQuery } from '@tanstack/react-query'
import { bookingsService } from '../bookings.service'

export const bookingKeys = {
  packages: ['service-packages'] as const,
  myBookings: ['bookings', 'my'] as const,
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
