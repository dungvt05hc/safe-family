import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/types/api'
import { accountsService } from '../accounts.service'
import type { Account, AccountFilters } from '../accounts.types'

export const ACCOUNTS_KEY = ['accounts'] as const

export function useAccounts(filters?: AccountFilters) {
  return useQuery<Account[], ApiError>({
    queryKey: [...ACCOUNTS_KEY, filters] as const,
    queryFn: () => accountsService.list(filters),
    retry: false,
  })
}

