import { apiClient } from '@/lib/api-client'
import type { AdminNoteResponse, AdminNoteListResponse, CreateAdminNoteRequest, AdminNotesFilters } from './adminNotes.types'

function buildQuery(filters: AdminNotesFilters): string {
  const params = new URLSearchParams()
  if (filters.familyId) params.set('familyId', filters.familyId)
  if (filters.bookingId) params.set('bookingId', filters.bookingId)
  if (filters.incidentId) params.set('incidentId', filters.incidentId)
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))
  return params.toString()
}

export const adminNotesApi = {
  list: (filters: AdminNotesFilters): Promise<AdminNoteListResponse> => {
    const qs = buildQuery(filters)
    return apiClient.get<AdminNoteListResponse>(`/api/admin/notes?${qs}`)
  },

  create: (req: CreateAdminNoteRequest): Promise<AdminNoteResponse> =>
    apiClient.post<AdminNoteResponse>('/api/admin/notes', req),
}
