import { useQuery } from '@tanstack/react-query'
import { adminCustomersApi } from './adminCustomers.api'
import type { AdminCustomerFilters } from './adminCustomers.types'

export const adminCustomerKeys = {
  list: (filters: AdminCustomerFilters) => ['admin', 'customers', 'list', filters] as const,
}

export function useAdminCustomers(filters: AdminCustomerFilters) {
  return useQuery({
    queryKey: adminCustomerKeys.list(filters),
    queryFn: () => adminCustomersApi.getCustomers(filters),
    placeholderData: (prev) => prev,
  })
}
