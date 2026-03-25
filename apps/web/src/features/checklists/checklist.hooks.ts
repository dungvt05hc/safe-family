import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { checklistApi } from './checklist.api'
import type { ChecklistItem, ChecklistStatus } from './checklist.types'
import type { ApiError } from '@/types/api'

// ── Query keys ────────────────────────────────────────────────────────────────

export const CHECKLIST_ITEMS_KEY = ['checklist-items'] as const

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Fetches and reconciles the family's checklist.
 * Re-fetches on window focus so the list stays in sync after a user completes
 * actions elsewhere (e.g. adding 2FA on the Accounts page).
 */
export function useChecklistItems() {
  return useQuery<ChecklistItem[], ApiError>({
    queryKey: CHECKLIST_ITEMS_KEY,
    queryFn:  checklistApi.getItems,
    staleTime: 30_000,
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

interface UpdateStatusVariables {
  id:     string
  status: ChecklistStatus
}

/**
 * Optimistically updates a checklist item's status in the cache, then
 * confirms with the server. Rolls back on failure.
 */
export function useUpdateChecklistStatus() {
  const queryClient = useQueryClient()

  return useMutation<ChecklistItem, ApiError, UpdateStatusVariables>({
    mutationFn: ({ id, status }) => checklistApi.updateStatus(id, { status }),

    // Optimistic update — immediate feedback, no loading flicker
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: CHECKLIST_ITEMS_KEY })

      const previous = queryClient.getQueryData<ChecklistItem[]>(CHECKLIST_ITEMS_KEY)

      queryClient.setQueryData<ChecklistItem[]>(CHECKLIST_ITEMS_KEY, (old) =>
        old?.map((item) => (item.id === id ? { ...item, status } : item)) ?? [],
      )

      return { previous }
    },

    // On server error roll back the optimistic update
    onError: (_err, _vars, context) => {
      if (context && (context as { previous?: ChecklistItem[] }).previous) {
        queryClient.setQueryData(
          CHECKLIST_ITEMS_KEY,
          (context as { previous: ChecklistItem[] }).previous,
        )
      }
    },

    // Always sync with server after mutation
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CHECKLIST_ITEMS_KEY })
    },
  })
}
