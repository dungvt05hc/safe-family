import { useMutation } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ApiError } from '@/types/api'
import { authService } from '../auth.service'

export function useLogout() {
  return useMutation<void, ApiError, void>({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Wipe the entire cache so stale authenticated data is never shown
      // to the next user on a shared machine.
      queryClient.clear()
    },
  })
}
