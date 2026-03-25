import { apiClient } from '@/lib/api-client'
import type { CreateIncidentRequest, IncidentResult } from './incidents.types'

export const incidentsService = {
  getAll: (): Promise<IncidentResult[]> =>
    apiClient.get('/api/incidents'),

  getById: (id: string): Promise<IncidentResult> =>
    apiClient.get(`/api/incidents/${id}`),

  create: (data: CreateIncidentRequest): Promise<IncidentResult> =>
    apiClient.post('/api/incidents', data),
}
