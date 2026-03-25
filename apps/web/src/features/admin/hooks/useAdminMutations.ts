import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../admin.service'
import { adminKeys } from './useAdminQueries'
import type { PaymentStatus, IncidentStatus } from '../admin.types'

export function useUpdateBookingStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PaymentStatus }) =>
      adminService.updateBookingStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.bookings }),
  })
}

export function useUpdateIncidentStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: IncidentStatus }) =>
      adminService.updateIncidentStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.incidents }),
  })
}
