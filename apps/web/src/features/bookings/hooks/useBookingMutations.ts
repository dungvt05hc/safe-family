import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsService } from '../bookings.service'
import { bookingKeys } from './useBookingQueries'

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bookingsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.myBookings })
    },
  })
}
