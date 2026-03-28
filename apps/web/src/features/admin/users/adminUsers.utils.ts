import type { UserRole } from '@/features/auth/auth.types'
import type { UserStatus } from './adminUsers.types'

/** Pill colour classes for each user role. */
export const USER_ROLE_COLORS: Record<UserRole, string> = {
  User:  'bg-gray-100 text-gray-600',
  Admin: 'bg-amber-100 text-amber-700',
}

/** Pill colour classes for each user account status. */
export const USER_STATUS_COLORS: Record<UserStatus, string> = {
  Active:      'bg-green-100 text-green-700',
  Suspended:   'bg-yellow-100 text-yellow-700',
  Deactivated: 'bg-red-100 text-red-700',
  Locked:      'bg-slate-100 text-slate-600',
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
