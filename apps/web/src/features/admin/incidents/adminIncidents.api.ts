import { apiClient } from '@/lib/api-client'
import type {
  AdminIncidentFiltersState,
  AdminIncidentListResponse,
  AdminIncidentDetail,
  AdminIncidentRow,
  AdminIncidentNoteInfo,
  AddIncidentNoteRequest,
  IncidentStatus,
} from './adminIncidents.types'

function buildQuery(f: AdminIncidentFiltersState): string {
  const params = new URLSearchParams()
  if (f.search)   params.set('search', f.search)
  if (f.severity) params.set('severity', f.severity)
  if (f.status)   params.set('status', f.status)
  if (f.type)     params.set('type', f.type)
  if (f.from)     params.set('from', f.from)
  if (f.to)       params.set('to', f.to)
  params.set('page', String(f.page))
  params.set('pageSize', String(f.pageSize))
  return params.toString()
}

export const adminIncidentsApi = {
  getIncidents: (filters: AdminIncidentFiltersState): Promise<AdminIncidentListResponse> => {
    const qs = buildQuery(filters)
    return apiClient.get<AdminIncidentListResponse>(`/api/admin/incidents?${qs}`)
  },

  getIncidentById: (id: string): Promise<AdminIncidentDetail> =>
    apiClient.get<AdminIncidentDetail>(`/api/admin/incidents/${id}`),

  updateStatus: (id: string, status: IncidentStatus): Promise<AdminIncidentRow> =>
    apiClient.patch<AdminIncidentRow>(`/api/admin/incidents/${id}/status`, { status }),

  addNote: (id: string, req: AddIncidentNoteRequest): Promise<AdminIncidentNoteInfo> =>
    apiClient.post<AdminIncidentNoteInfo>(`/api/admin/incidents/${id}/notes`, req),
}
