import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/types/api'
import { accountsService } from '../accounts.service'
import type { Account } from '../accounts.types'

export const ACCOUNTS_KEY = ['accounts'] as const

export function useAccounts() {
  return useQuery<Account[], ApiError>({
    queryKey: ACCOUNTS_KEY,
    queryFn: accountsService.list,
    retry: false,
  })
}
