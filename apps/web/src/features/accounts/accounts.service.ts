import { apiClient } from '@/lib/api-client'
import type { Account, AccountFormValues } from './accounts.types'

export const accountsService = {
  list: (): Promise<Account[]> =>
    apiClient.get<Account[]>('/api/accounts'),

  getById: (id: string): Promise<Account> =>
    apiClient.get<Account>(`/api/accounts/${id}`),

  create: (data: AccountFormValues): Promise<Account> =>
    apiClient.post<Account>('/api/accounts', data),

  update: (id: string, data: AccountFormValues): Promise<Account> =>
    apiClient.put<Account>(`/api/accounts/${id}`, data),
}
