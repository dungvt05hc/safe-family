import { useMutation } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ApiError } from '@/types/api'
import { accountsService } from '../accounts.service'
import { ACCOUNTS_KEY } from './useAccounts'
import type { Account, AccountFormValues } from '../accounts.types'

export function useCreateAccount() {
  return useMutation<Account, ApiError, AccountFormValues>({
    mutationFn: accountsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
    },
  })
}

export function useUpdateAccount(id: string) {
  return useMutation<Account, ApiError, AccountFormValues>({
    mutationFn: (data) => accountsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
    },
  })
}

export function useArchiveAccount() {
  return useMutation<void, ApiError, string>({
    mutationFn: accountsService.archive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
    },
  })
}

