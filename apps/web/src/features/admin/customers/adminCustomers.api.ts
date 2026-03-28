import { apiClient } from '@/lib/api-client'
import type { AdminCustomerFilters, AdminCustomerListResponse } from './adminCustomers.types'

function buildQuery(filters: AdminCustomerFilters): string {
  const params = new URLSearchParams()
  if (filters.search)    params.set('search', filters.search)
  if (filters.riskLevel) params.set('riskLevel', filters.riskLevel)
  if (filters.planType)  params.set('planType', filters.planType)
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))
  return params.toString()
}

export const adminCustomersApi = {
  getCustomers: (filters: AdminCustomerFilters): Promise<AdminCustomerListResponse> => {
    const qs = buildQuery(filters)
    return apiClient.get<AdminCustomerListResponse>(`/api/admin/customers?${qs}`)
  },
}
