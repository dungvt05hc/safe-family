import { apiClient } from '@/lib/api-client'
import type { AdminUserListResponse, AdminUserDetail, AdminUserFilters, UserStatus, TriggerPasswordResetResponse } from './adminUsers.types'
import type { UserRole } from '@/features/auth/auth.types'

function buildQuery(filters: AdminUserFilters): string {
  const params = new URLSearchParams()
  if (filters.search)        params.set('search', filters.search)
  if (filters.role)          params.set('role', filters.role)
  if (filters.status)        params.set('status', filters.status)
  if (filters.emailVerified) params.set('emailVerified', filters.emailVerified)
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))
  return params.toString()
}

export const adminUsersApi = {
  getUsers: (filters: AdminUserFilters): Promise<AdminUserListResponse> => {
    const qs = buildQuery(filters)
    return apiClient.get<AdminUserListResponse>(`/api/admin/users?${qs}`)
  },

  getUserById: (id: string): Promise<AdminUserDetail> =>
    apiClient.get<AdminUserDetail>(`/api/admin/users/${id}`),

  updateUserStatus: (id: string, status: UserStatus): Promise<AdminUserDetail> =>
    apiClient.patch<AdminUserDetail>(`/api/admin/users/${id}/status`, { status }),

  updateUserRole: (id: string, role: UserRole): Promise<AdminUserDetail> =>
    apiClient.patch<AdminUserDetail>(`/api/admin/users/${id}/role`, { role }),

  triggerPasswordReset: (id: string): Promise<TriggerPasswordResetResponse> =>
    apiClient.post<TriggerPasswordResetResponse>(`/api/admin/users/${id}/trigger-password-reset`),
}
