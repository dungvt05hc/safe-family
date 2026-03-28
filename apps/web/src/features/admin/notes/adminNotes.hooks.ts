import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminNotesApi } from './adminNotes.api'
import type { AdminNotesFilters, CreateAdminNoteRequest } from './adminNotes.types'

export const adminNoteKeys = {
  all:  () => ['admin', 'notes'] as const,
  list: (filters: AdminNotesFilters) => ['admin', 'notes', 'list', filters] as const,
}

export function useAdminNotesList(filters: AdminNotesFilters) {
  return useQuery({
    queryKey: adminNoteKeys.list(filters),
    queryFn: () => adminNotesApi.list(filters),
    placeholderData: (prev) => prev,
  })
}

export function useCreateAdminNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateAdminNoteRequest) => adminNotesApi.create(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminNoteKeys.all() })
    },
  })
}
