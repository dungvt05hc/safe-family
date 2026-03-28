import { useState } from 'react'
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react'
import { AdminSpinner, AdminError, AdminEmpty } from '../components/AdminStateViews'
import { useActivityList } from './adminActivity.hooks'
import { AdminActivityFilters } from './AdminActivityFilters'
import { AdminActivityTable } from './AdminActivityTable'

const PAGE_SIZE = 50

export function AdminActivityPage() {
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data, isLoading, isError, refetch } = useActivityList({
    action: action || undefined,
    from: from ? `${from}T00:00:00Z` : undefined,
    to: to ? `${to}T23:59:59.999Z` : undefined,
    page,
    pageSize: PAGE_SIZE,
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1

  function handleFilterChange(setter: (v: string) => void) {
    return (value: string) => {
      setter(value)
      setPage(1)
    }
  }

  function handleClearFilters() {
    setAction('')
    setFrom('')
    setTo('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" aria-hidden="true" />
            System Activity
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Recent audit trail of important system events.
          </p>
        </div>
        {data && (
          <span className="text-sm text-gray-500">
            {data.total.toLocaleString()} {data.total === 1 ? 'entry' : 'entries'}
          </span>
        )}
      </div>

      {/* Filters */}
      <AdminActivityFilters
        action={action}
        from={from}
        to={to}
        onActionChange={handleFilterChange(setAction)}
        onFromChange={handleFilterChange(setFrom)}
        onToChange={handleFilterChange(setTo)}
        onClear={handleClearFilters}
      />

      {/* Content */}
      {isLoading && <AdminSpinner />}
      {isError && <AdminError message="Failed to load activity log." onRetry={refetch} />}

      {!isLoading && !isError && (!data || data.items.length === 0) && (
        <AdminEmpty
          icon={<Activity className="w-10 h-10" />}
          message="No activity entries match the current filters."
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <>
          <AdminActivityTable items={data.items} />

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {totalPages > 1 ? `Page ${page} of ${totalPages} — ` : ''}
              {data.total.toLocaleString()} {data.total === 1 ? 'entry' : 'entries'}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Previous page"
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  Prev
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Next page"
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
