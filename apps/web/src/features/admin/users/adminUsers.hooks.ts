import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminUsersApi } from './adminUsers.api'
import type { AdminUserFilters, UserStatus } from './adminUsers.types'
import type { UserRole } from '@/features/auth/auth.types'

export const adminUserKeys = {
  list:   (filters: AdminUserFilters) => ['admin', 'users', 'list', filters] as const,
  detail: (id: string)               => ['admin', 'users', 'detail', id] as const,
}

export function useAdminUsers(filters: AdminUserFilters) {
  return useQuery({
    queryKey: adminUserKeys.list(filters),
    queryFn: () => adminUsersApi.getUsers(filters),
    placeholderData: (prev) => prev,
  })
}

export function useAdminUserDetail(id: string) {
  return useQuery({
    queryKey: adminUserKeys.detail(id),
    queryFn: () => adminUsersApi.getUserById(id),
    enabled: !!id,
  })
}

export function useUpdateUserStatus(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status: UserStatus) => adminUsersApi.updateUserStatus(userId, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(adminUserKeys.detail(userId), updated)
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'list'] })
    },
  })
}

export function useUpdateUserRole(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (role: UserRole) => adminUsersApi.updateUserRole(userId, role),
    onSuccess: (updated) => {
      queryClient.setQueryData(adminUserKeys.detail(userId), updated)
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'list'] })
    },
  })
}

export function useTriggerPasswordReset(userId: string) {
  return useMutation({
    mutationFn: () => adminUsersApi.triggerPasswordReset(userId),
  })
}
