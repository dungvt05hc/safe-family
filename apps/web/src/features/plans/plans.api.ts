import { apiClient } from '@/lib/api-client'
import type { FamilySafetyPlan, IncidentRecoveryPack } from './plans.types'

export const plansApi = {
  getSafetyPlans: (): Promise<FamilySafetyPlan[]> =>
    apiClient.get('/api/plans/safety'),

  getSafetyPlanById: (id: string): Promise<FamilySafetyPlan> =>
    apiClient.get(`/api/plans/safety/${id}`),

  getIncidentRecoveryPacks: (): Promise<IncidentRecoveryPack[]> =>
    apiClient.get('/api/plans/incident-recovery'),

  getIncidentRecoveryPackById: (id: string): Promise<IncidentRecoveryPack> =>
    apiClient.get(`/api/plans/incident-recovery/${id}`),
}
