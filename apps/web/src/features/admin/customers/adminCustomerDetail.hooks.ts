import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminCustomerDetailApi } from './adminCustomerDetail.api'
import type { AddCustomerNoteRequest } from './adminCustomerDetail.types'

export const adminCustomerDetailKeys = {
  detail: (familyId: string) => ['admin', 'customers', 'detail', familyId] as const,
}

export function useAdminCustomerDetail(familyId: string) {
  return useQuery({
    queryKey: adminCustomerDetailKeys.detail(familyId),
    queryFn:  () => adminCustomerDetailApi.getDetail(familyId),
    enabled:  !!familyId,
  })
}

export function useAddCustomerNote(familyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: AddCustomerNoteRequest) =>
      adminCustomerDetailApi.addNote(familyId, request),
    onSuccess: () => {
      // Invalidate detail so the notes list refreshes
      queryClient.invalidateQueries({ queryKey: adminCustomerDetailKeys.detail(familyId) })
    },
  })
}
