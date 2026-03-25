import { useMutation } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ApiError } from '@/types/api'
import { authService } from '../auth.service'
import { AUTH_ME_KEY } from './useCurrentUser'
import type { AuthUser, RegisterFormValues } from '../auth.types'

export function useRegister() {
  return useMutation<AuthUser, ApiError, RegisterFormValues>({
    mutationFn: authService.register,
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_ME_KEY, user)
    },
  })
}
