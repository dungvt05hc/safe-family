import { useMutation } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ApiError } from '@/types/api'
import { authService } from '../auth.service'
import { AUTH_ME_KEY } from './useCurrentUser'
import type { AuthUser, LoginFormValues } from '../auth.types'

export function useLogin() {
  return useMutation<AuthUser, ApiError, LoginFormValues>({
    mutationFn: authService.login,
    onSuccess: (user) => {
      // Update the cache immediately so every useCurrentUser consumer reflects
      // the new session without an extra network round-trip.
      queryClient.setQueryData(AUTH_ME_KEY, user)
    },
  })
}
