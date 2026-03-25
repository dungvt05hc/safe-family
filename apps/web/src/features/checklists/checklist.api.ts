/**
 * checklist.api.ts
 *
 * All network calls for the checklist feature.
 * Swap the apiClient calls here when the real API becomes available — no
 * other file needs to change.
 */
import { apiClient } from '@/lib/api-client'
import type { ChecklistItem, UpdateChecklistStatusRequest } from './checklist.types'

export const checklistApi = {
  /** GET /api/checklists — reconciles and returns the family's checklist */
  getItems: (): Promise<ChecklistItem[]> =>
    apiClient.get<ChecklistItem[]>('/api/checklists'),

  /** PATCH /api/checklists/{id}/status */
  updateStatus: (id: string, request: UpdateChecklistStatusRequest): Promise<ChecklistItem> =>
    apiClient.patch<ChecklistItem>(`/api/checklists/${id}/status`, request),
}
