/**
 * safety-tasks.api.ts
 *
 * All network calls for the safety tasks feature.
 */
import { apiClient } from '@/lib/api-client'
import type {
  SafetyTask,
  SafetyTaskApiFilters,
  SafetyTaskSummary,
  UpdateSafetyTaskStatusRequest,
} from './safety-tasks.types'

export const safetyTasksApi = {
  /** GET /api/tasks — returns the family's safety task list, optionally filtered */
  getTasks: (filters?: SafetyTaskApiFilters): Promise<SafetyTask[]> => {
    const params = new URLSearchParams()
    if (filters?.status)     params.set('status',     filters.status)
    if (filters?.priority)   params.set('priority',   filters.priority)
    if (filters?.phase)      params.set('phase',      filters.phase)
    if (filters?.category)   params.set('category',   filters.category)
    if (filters?.sourceType) params.set('sourceType', filters.sourceType)
    if (filters?.targetType) params.set('targetType', filters.targetType)
    if (filters?.targetId)   params.set('targetId',   filters.targetId)
    if (filters?.search)     params.set('search',     filters.search)
    const query = params.toString()
    return apiClient.get<SafetyTask[]>(query ? `/api/tasks?${query}` : '/api/tasks')
  },

  /** GET /api/tasks/{id} — returns a single task or null (404) */
  getById: (id: string): Promise<SafetyTask> =>
    apiClient.get<SafetyTask>(`/api/tasks/${id}`),

  /** GET /api/tasks/summary — returns aggregate counts for the family */
  getSummary: (): Promise<SafetyTaskSummary> =>
    apiClient.get<SafetyTaskSummary>('/api/tasks/summary'),

  /** PATCH /api/tasks/{id}/status — updates the status of a single task */
  updateStatus: (id: string, request: UpdateSafetyTaskStatusRequest): Promise<SafetyTask> =>
    apiClient.patch<SafetyTask>(`/api/tasks/${id}/status`, request),
}
