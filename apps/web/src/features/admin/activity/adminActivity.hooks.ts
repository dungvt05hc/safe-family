import { useQuery } from '@tanstack/react-query'
import { adminActivityApi } from './adminActivity.api'
import type { ActivityFilters } from './adminActivity.types'

export const activityKeys = {
  all:  () => ['admin', 'activity'] as const,
  list: (filters: ActivityFilters) => ['admin', 'activity', 'list', filters] as const,
}

export function useActivityList(filters: ActivityFilters) {
  return useQuery({
    queryKey: activityKeys.list(filters),
    queryFn: () => adminActivityApi.list(filters),
    placeholderData: (prev) => prev,
  })
}
