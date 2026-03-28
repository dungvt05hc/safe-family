import { useState } from 'react'
import { Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAdminUsers } from './adminUsers.hooks'
import type { AdminUserFilters } from './adminUsers.types'
import { AdminUserFiltersBar } from './AdminUserFilters'
import { AdminUsersTable } from './AdminUsersTable'
import { AdminSpinner, AdminError, AdminEmpty } from '../components/AdminStateViews'

const DEFAULT_FILTERS: AdminUserFilters = {
  search: '',
  role: '',
  status: '',
  emailVerified: '',
  page: 1,
  pageSize: 25,
}

export function AdminUsersPage() {
  const [filters, setFilters] = useState<AdminUserFilters>(DEFAULT_FILTERS)
  const { data, isLoading, isFetching, isError, refetch } = useAdminUsers(filters)

  function handleFiltersChange(next: Partial<AdminUserFilters>) {
    setFilters((prev) => ({ ...prev, ...next }))
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / filters.pageSize)) : 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5" aria-live="polite" aria-atomic="true">
            {data ? `${data.total.toLocaleString()} total` : '\u00A0'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <AdminUserFiltersBar filters={filters} onChange={handleFiltersChange} />

      {/* Table */}
      <div
        className="overflow-x-auto rounded-lg border bg-white shadow-sm transition-opacity"
        aria-busy={isFetching}
        style={{ opacity: isFetching && !isLoading ? 0.6 : 1 }}
      >
        {isLoading ? (
          <AdminSpinner />
        ) : isError ? (
          <AdminError
            message="Failed to load users."
            onRetry={() => refetch()}
          />
        ) : !data || data.items.length === 0 ? (
          <AdminEmpty
            icon={<Users className="w-10 h-10" />}
            message={
              filters.search || filters.role || filters.status || filters.emailVerified
                ? 'No users match your filters.'
                : 'No users yet.'
            }
          />
        ) : (
          <AdminUsersTable users={data.items} />
        )}
      </div>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Page {filters.page} of {totalPages} &mdash; {data.total.toLocaleString()} users
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={filters.page <= 1}
              onClick={() => handleFiltersChange({ page: filters.page - 1 })}
              aria-label="Previous page"
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Prev
            </button>
            <button
              disabled={filters.page >= totalPages}
              onClick={() => handleFiltersChange({ page: filters.page + 1 })}
              aria-label="Next page"
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
