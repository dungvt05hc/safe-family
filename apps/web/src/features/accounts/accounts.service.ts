import { apiClient } from '@/lib/api-client'
import type { Account, AccountFilters, AccountFormValues, AccountSummary } from './accounts.types'

export const accountsService = {
  list: (filters?: AccountFilters): Promise<Account[]> => {
    const params = new URLSearchParams()
    if (filters?.memberId) params.set('memberId', filters.memberId)
    if (filters?.accountType) params.set('accountType', filters.accountType)
    if (filters?.search) params.set('search', filters.search)
    const qs = params.toString()
    return apiClient.get<Account[]>(`/api/accounts${qs ? `?${qs}` : ''}`)
  },

  getById: (id: string): Promise<Account> =>
    apiClient.get<Account>(`/api/accounts/${id}`),

  create: (data: AccountFormValues): Promise<Account> =>
    apiClient.post<Account>('/api/accounts', data),

  update: (id: string, data: AccountFormValues): Promise<Account> =>
    apiClient.put<Account>(`/api/accounts/${id}`, data),

  archive: (id: string): Promise<void> =>
    apiClient.del(`/api/accounts/${id}`),

  getSummary: (): Promise<AccountSummary> =>
    apiClient.get<AccountSummary>('/api/accounts/summary'),
}

