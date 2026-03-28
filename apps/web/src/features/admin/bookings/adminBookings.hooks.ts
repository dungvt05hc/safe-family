import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { adminBookingsApi } from './adminBookings.api'
import type {
  AdminBookingFilters,
  AdminBookingRow,
  BookingStatus,
  PaymentStatus,
  AssignBookingRequest,
  AddBookingNoteRequest,
} from './adminBookings.types'

// ── Query key factory ─────────────────────────────────────────────────────────

export const adminBookingKeys = {
  all:    ()                             => ['admin', 'bookings'] as const,
  list:   (filters: AdminBookingFilters) => ['admin', 'bookings', 'list', filters] as const,
  detail: (id: string)                   => ['admin', 'bookings', 'detail', id] as const,
}

// ── Shared cache-update helper ────────────────────────────────────────────────

function updateBookingCaches(qc: QueryClient, updated: AdminBookingRow) {
  qc.invalidateQueries({ queryKey: adminBookingKeys.all() })
  qc.setQueryData(adminBookingKeys.detail(updated.id), (prev: unknown) =>
    prev ? { ...(prev as object), ...updated } : prev,
  )
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function useAdminBookingsList(filters: AdminBookingFilters) {
  return useQuery({
    queryKey: adminBookingKeys.list(filters),
    queryFn: () => adminBookingsApi.getBookings(filters),
    placeholderData: (prev) => prev,
  })
}

export function useAdminBookingDetail(id: string | null) {
  return useQuery({
    queryKey: adminBookingKeys.detail(id ?? ''),
    queryFn: () => adminBookingsApi.getBookingById(id!),
    enabled: !!id,
    staleTime: 30_000,
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useUpdateBookingStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      adminBookingsApi.updateStatus(id, status),
    onSuccess: (updated) => updateBookingCaches(qc, updated),
  })
}

export function useUpdateBookingPaymentStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PaymentStatus }) =>
      adminBookingsApi.updatePaymentStatus(id, status),
    onSuccess: (updated) => updateBookingCaches(qc, updated),
  })
}

export function useAssignBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: AssignBookingRequest }) =>
      adminBookingsApi.assign(id, req),
    onSuccess: (updated) => updateBookingCaches(qc, updated),
  })
}

export function useAddBookingNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: AddBookingNoteRequest }) =>
      adminBookingsApi.addNote(id, req),
    onSuccess: (_note, { id }) => {
      qc.invalidateQueries({ queryKey: adminBookingKeys.detail(id) })
    },
  })
}
