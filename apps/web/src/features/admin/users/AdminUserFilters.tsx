import { Search } from 'lucide-react'
import type { AdminUserFilters, UserStatus } from './adminUsers.types'
import type { UserRole } from '@/features/auth/auth.types'

interface Props {
  filters: AdminUserFilters
  onChange: (next: Partial<AdminUserFilters>) => void
}

const ROLES: { value: UserRole | ''; label: string }[] = [
  { value: '', label: 'All roles' },
  { value: 'User',  label: 'User' },
  { value: 'Admin', label: 'Admin' },
]

const STATUSES: { value: UserStatus | ''; label: string }[] = [
  { value: '',            label: 'All statuses' },
  { value: 'Active',      label: 'Active' },
  { value: 'Suspended',   label: 'Suspended' },
  { value: 'Deactivated', label: 'Deactivated' },
]

const EMAIL_VERIFIED_OPTIONS: { value: '' | 'true' | 'false'; label: string }[] = [
  { value: '',      label: 'Any verification' },
  { value: 'true',  label: 'Verified' },
  { value: 'false', label: 'Unverified' },
]

export function AdminUserFiltersBar({ filters, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 w-64">
        <Search className="w-4 h-4 shrink-0 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          aria-label="Search users"
          placeholder="Search by name or email…"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value, page: 1 })}
          className="flex-1 bg-transparent outline-none placeholder:text-gray-400 text-gray-800 text-sm"
        />
      </div>

      {/* Role */}
      <select
        aria-label="Filter by role"
        value={filters.role}
        onChange={(e) => onChange({ role: e.target.value as UserRole | '', page: 1 })}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>

      {/* Status */}
      <select
        aria-label="Filter by status"
        value={filters.status}
        onChange={(e) => onChange({ status: e.target.value as UserStatus | '', page: 1 })}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {/* Email verified */}
      <select
        aria-label="Filter by email verification"
        value={filters.emailVerified}
        onChange={(e) => onChange({ emailVerified: e.target.value as '' | 'true' | 'false', page: 1 })}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        {EMAIL_VERIFIED_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Clear filters */}
      {(filters.search || filters.role || filters.status || filters.emailVerified) && (
        <button
          type="button"
          onClick={() => onChange({ search: '', role: '', status: '', emailVerified: '', page: 1 })}
          className="text-xs text-gray-500 underline hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
