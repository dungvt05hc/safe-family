import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/types/api'
import { authService } from '../auth.service'
import type { AuthUser } from '../auth.types'

export const AUTH_ME_KEY = ['auth', 'me'] as const

/**
 * Fetches the currently authenticated user.
 * - staleTime: Infinity — only refetches after explicit invalidation (login/logout)
 * - retry: false       — don't retry 401s; unauthenticated is an expected state
 *
 * Usage:
 *   const { data: user, isLoading } = useCurrentUser()
 *   if (!user) → not authenticated
 */
export function useCurrentUser() {
  return useQuery<AuthUser, ApiError>({
    queryKey: AUTH_ME_KEY,
    queryFn: authService.me,
    staleTime: Infinity,
    retry: false,
  })
}
