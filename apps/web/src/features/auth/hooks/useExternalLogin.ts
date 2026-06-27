import { useMutation } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ApiError } from '@/types/api'
import { authService } from '../auth.service'
import { AUTH_ME_KEY } from './useCurrentUser'
import { ENTITLEMENTS_KEY } from '@/features/entitlements/hooks/useMyEntitlements'
import type { AuthUser } from '../auth.types'

/**
 * Generic hook for signing in via any external identity provider.
 *
 * Usage:
 *   const mutation = useExternalLogin('Google')
 *   mutation.mutate(idToken)
 *
 * To add a new provider:
 *   const mutation = useExternalLogin('Apple')   // once AppleTokenVerifier is registered on the backend
 *   mutation.mutate(appleIdentityToken)
 *
 * The `provider` string must match the `ProviderName` of the corresponding
 * `IExternalTokenVerifier` registered in the backend DI container.
 */
export function useExternalLogin(provider: string) {
  return useMutation<AuthUser, ApiError, string>({
    mutationFn: (idToken: string) => authService.externalLogin(provider, idToken),
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_ME_KEY, user)
      queryClient.invalidateQueries({ queryKey: ENTITLEMENTS_KEY })
    },
  })
}
