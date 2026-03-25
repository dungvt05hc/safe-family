import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/types/api'
import { familyService } from '../families.service'
import type { Family } from '../families.types'

export const MY_FAMILY_KEY = ['families', 'me'] as const

export function useMyFamily() {
  return useQuery<Family, ApiError>({
    queryKey: MY_FAMILY_KEY,
    queryFn: familyService.myFamily,
    retry: false,
    // 404 means no family yet — treat as an expected state, not an error
    throwOnError: (err) => !err.isNotFound,
  })
}
