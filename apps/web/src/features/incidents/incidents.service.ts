import { apiClient } from '@/lib/api-client'
import type {
  CreateIncidentRequest,
  IncidentResult,
  UpdateIncidentStatusRequest,
} from './incidents.types'

export const incidentsService = {
  getAll: (): Promise<IncidentResult[]> =>
    apiClient.get('/api/incidents'),

  getById: (id: string): Promise<IncidentResult> =>
    apiClient.get(`/api/incidents/${id}`),

  create: (data: CreateIncidentRequest): Promise<IncidentResult> =>
    apiClient.post('/api/incidents', data),

  updateStatus: (id: string, data: UpdateIncidentStatusRequest): Promise<IncidentResult> =>
    apiClient.patch(`/api/incidents/${id}/status`, data),
}
