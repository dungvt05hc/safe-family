import { useQuery } from '@tanstack/react-query'
import { plansApi } from './plans.api'
import type { FamilySafetyPlan, IncidentRecoveryPack } from './plans.types'
import type { ApiError } from '@/types/api'

// ── Query keys ────────────────────────────────────────────────────────────────

export const planKeys = {
  safety:          ['plans', 'safety']           as const,
  incidentRecovery: ['plans', 'incident-recovery'] as const,
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function useSafetyPlans() {
  return useQuery<FamilySafetyPlan[], ApiError>({
    queryKey: planKeys.safety,
    queryFn:  plansApi.getSafetyPlans,
    retry: (failureCount, error) => {
      // 402/403 are definitive — no point retrying.
      if (error.isPaymentRequired || error.isForbidden) return false
      return failureCount < 2
    },
  })
}

export function useIncidentRecoveryPacks() {
  return useQuery<IncidentRecoveryPack[], ApiError>({
    queryKey: planKeys.incidentRecovery,
    queryFn:  plansApi.getIncidentRecoveryPacks,
    retry: (failureCount, error) => {
      if (error.isPaymentRequired || error.isForbidden) return false
      return failureCount < 2
    },
  })
}
