import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { safetyTasksApi } from './safety-tasks.api'
import type {
  SafetyTask,
  SafetyTaskApiFilters,
  SafetyTaskSummary,
  TaskStatus,
} from './safety-tasks.types'
import type { ApiError } from '@/types/api'

// ── Query keys ────────────────────────────────────────────────────────────────

export const TASKS_KEY         = ['safety-tasks'] as const
export const TASK_KEY          = (id: string) => [...TASKS_KEY, id] as const
export const TASKS_SUMMARY_KEY = ['safety-tasks-summary'] as const

// ── Queries ───────────────────────────────────────────────────────────────────

/** Fetches the family's safety task list with optional server-side filters. */
export function useSafetyTasks(filters?: SafetyTaskApiFilters) {
  return useQuery<SafetyTask[], ApiError>({
    queryKey: filters ? [...TASKS_KEY, filters] : TASKS_KEY,
    queryFn:  () => safetyTasksApi.getTasks(filters),
    staleTime: 30_000,
  })
}

/** Fetches a single safety task by ID. Returns `undefined` while loading or if not found (404). */
export function useSafetyTask(taskId: string) {
  return useQuery<SafetyTask, ApiError>({
    queryKey: TASK_KEY(taskId),
    queryFn:  () => safetyTasksApi.getById(taskId),
    enabled:  !!taskId,
    staleTime: 30_000,
  })
}

/** Fetches aggregate counts (total, pending, in-progress, completed, high-priority, immediate). */
export function useSafetyTaskSummary() {
  return useQuery<SafetyTaskSummary, ApiError>({
    queryKey: TASKS_SUMMARY_KEY,
    queryFn:  safetyTasksApi.getSummary,
    staleTime: 30_000,
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

interface UpdateStatusVariables {
  id:     string
  status: TaskStatus
  notes?: string
}

/**
 * Optimistically updates a task's status in the cache, then confirms with
 * the server. Rolls back on failure.
 */
export function useUpdateSafetyTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation<SafetyTask, ApiError, UpdateStatusVariables>({
    mutationFn: ({ id, status, notes }) =>
      safetyTasksApi.updateStatus(id, { status, notes }),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY })
      const previous = queryClient.getQueryData<SafetyTask[]>(TASKS_KEY)

      queryClient.setQueryData<SafetyTask[]>(TASKS_KEY, (old = []) =>
        old.map((t) => (t.id === id ? { ...t, status } : t)),
      )

      return { previous }
    },

    onError: (_err, _vars, ctx: any) => {
      if (ctx?.previous) {
        queryClient.setQueryData<SafetyTask[]>(TASKS_KEY, ctx.previous)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
      queryClient.invalidateQueries({ queryKey: TASKS_SUMMARY_KEY })
    },
  })
}
