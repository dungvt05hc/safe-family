import type { UserRole } from '@/features/auth/auth.types'

export type UserStatus = 'Active' | 'Suspended' | 'Deactivated' | 'Locked'
export type FamilyMemberRole = 'Owner' | 'Member'

export interface AdminUserFamilySummary {
  familyId: string
  familyName: string
  familyMemberRole: FamilyMemberRole
}

export interface AdminUserRow {
  id: string
  email: string
  displayName: string
  role: UserRole
  status: UserStatus
  emailVerified: boolean
  createdAt: string
  lastLoginAt: string | null
  family: AdminUserFamilySummary | null
}

export interface AdminUserDetail {
  id: string
  email: string
  displayName: string
  phone: string | null
  role: UserRole
  status: UserStatus
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  family: AdminUserFamilySummary | null
}

export interface AdminUserListResponse {
  items: AdminUserRow[]
  total: number
  page: number
  pageSize: number
}

export interface AdminUserFilters {
  search: string
  role: UserRole | ''
  status: UserStatus | ''
  emailVerified: '' | 'true' | 'false'
  page: number
  pageSize: number
}

export interface TriggerPasswordResetResponse {
  token: string
  expiresAt: string
}
