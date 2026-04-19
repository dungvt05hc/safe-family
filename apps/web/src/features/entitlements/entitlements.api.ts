import { apiClient } from '@/lib/api-client'
import type { Entitlement } from './entitlements.types'

export const entitlementsApi = {
  getMyEntitlements(): Promise<Entitlement[]> {
    return apiClient.get<Entitlement[]>('/api/me/entitlements')
  },
}
