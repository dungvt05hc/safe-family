/**
 * checklist.api.ts
 *
 * All network calls for the checklist feature.
 * Swap the apiClient calls here when the real API becomes available — no
 * other file needs to change.
 */
import { apiClient } from '@/lib/api-client'
import type {
  ChecklistApiFilters,
  ChecklistItem,
  ChecklistSummary,
  UpdateChecklistStatusRequest,
} from './checklist.types'

export const checklistApi = {
  /** GET /api/checklists — reconciles and returns the family's checklist, optionally filtered */
  getItems: (filters?: ChecklistApiFilters): Promise<ChecklistItem[]> => {
    const params = new URLSearchParams()
    if (filters?.severity) params.set('severity', filters.severity)
    if (filters?.status)   params.set('status',   filters.status)
    if (filters?.category) params.set('category', filters.category)
    if (filters?.search)   params.set('search',   filters.search)
    const query = params.toString()
    return apiClient.get<ChecklistItem[]>(query ? `/api/checklists?${query}` : '/api/checklists')
  },

  /** GET /api/checklists/summary — returns aggregate counts for the family */
  getSummary: (): Promise<ChecklistSummary> =>
    apiClient.get<ChecklistSummary>('/api/checklists/summary'),

  /** PATCH /api/checklists/{id}/status */
  updateStatus: (id: string, request: UpdateChecklistStatusRequest): Promise<ChecklistItem> =>
    apiClient.patch<ChecklistItem>(`/api/checklists/${id}/status`, request),
}
