import { useQuery } from '@tanstack/react-query'
import { entitlementsApi } from '../entitlements.api'
import type { Entitlement } from '../entitlements.types'
import type { ApiError } from '@/types/api'

export const ENTITLEMENTS_KEY = ['entitlements', 'me'] as const

/**
 * Fetches all entitlements for the authenticated user's family.
 * Returns active and inactive entitlements ordered newest-first.
 */
export function useMyEntitlements() {
  return useQuery<Entitlement[], ApiError>({
    queryKey: ENTITLEMENTS_KEY,
    queryFn:  entitlementsApi.getMyEntitlements,
    retry: (failureCount, error) => {
      if (error.isForbidden || error.isNotFound) return false
      return failureCount < 2
    },
  })
}
