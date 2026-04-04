import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsService } from '../bookings.service'
import { bookingKeys } from './useBookingQueries'

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bookingsService.createAndSubmit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.myBookings })
    },
  })
}

export function useInitiatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookingId: string) => bookingsService.initiatePayment(bookingId),
    onSuccess: (data, bookingId) => {
      if (data.paymentUrl) {
        window.open(data.paymentUrl, '_blank', 'noopener,noreferrer')
      }
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) })
      queryClient.invalidateQueries({ queryKey: bookingKeys.paymentOrders(bookingId) })
    },
  })
}

export function useRetryPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookingId: string) => bookingsService.retryPayment(bookingId),
    onSuccess: (data, bookingId) => {
      if (data.paymentUrl) {
        window.open(data.paymentUrl, '_blank', 'noopener,noreferrer')
      }
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) })
      queryClient.invalidateQueries({ queryKey: bookingKeys.paymentOrders(bookingId) })
    },
  })
}
