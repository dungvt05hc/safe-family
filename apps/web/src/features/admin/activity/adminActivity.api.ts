import { apiClient } from '@/lib/api-client'
import type { ActivityListResponse, ActivityFilters } from './adminActivity.types'

function buildQuery(filters: ActivityFilters): string {
  const params = new URLSearchParams()
  if (filters.action) params.set('action', filters.action)
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))
  return params.toString()
}

export const adminActivityApi = {
  list: (filters: ActivityFilters): Promise<ActivityListResponse> => {
    const qs = buildQuery(filters)
    return apiClient.get<ActivityListResponse>(`/api/admin/activity?${qs}`)
  },
}
