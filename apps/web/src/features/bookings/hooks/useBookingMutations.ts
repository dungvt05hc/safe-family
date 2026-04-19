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
    onSuccess: (_data, bookingId) => {
      // Store the bookingId so the payment callback page can redirect back here.
      sessionStorage.setItem('payment_booking_id', bookingId)
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) })
      queryClient.invalidateQueries({ queryKey: bookingKeys.paymentOrders(bookingId) })
    },
  })
}

export function useRetryPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookingId: string) => bookingsService.retryPayment(bookingId),
    onSuccess: (_data, bookingId) => {
      // Store the bookingId so the payment callback page can redirect back here.
      sessionStorage.setItem('payment_booking_id', bookingId)
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) })
      queryClient.invalidateQueries({ queryKey: bookingKeys.paymentOrders(bookingId) })
    },
  })
}

export function useSyncPaymentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookingId: string) => bookingsService.syncPaymentStatus(bookingId),
    onSuccess: (_data, bookingId) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) })
      queryClient.invalidateQueries({ queryKey: bookingKeys.paymentOrders(bookingId) })
    },
  })
}
