import { useCallback, useState } from 'react'
import { BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminSpinner, AdminError } from '../components/AdminStateViews'
import { AdminReportFiltersBar } from '../reports/AdminReportFilters'
import { AdminReportsTable } from '../reports/AdminReportsTable'
import { AdminReportDetailPanel } from '../reports/AdminReportDetailPanel'
import { useAdminReportsList } from '../reports/adminReports.hooks'
import type { AdminReportFiltersState } from '../reports/adminReports.types'

const DEFAULT_FILTERS: AdminReportFiltersState = {
  search: '',
  reportType: '',
  from: '',
  to: '',
  page: 1,
  pageSize: 25,
}

export function AdminReportsPage() {
  const [filters, setFilters] = useState<AdminReportFiltersState>(DEFAULT_FILTERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading, isError, isFetching, refetch } = useAdminReportsList(filters)

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize))

  const handleFiltersChange = useCallback((next: Partial<AdminReportFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...next }))
  }, [])

  const hasActiveFilters =
    !!filters.search || !!filters.reportType || !!filters.from || !!filters.to

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          All safety reports generated across families.{total > 0 && ` ${total} total.`}
        </p>
      </div>

      {/* Filters */}
      <AdminReportFiltersBar filters={filters} onChange={handleFiltersChange} />

      {/* Table container */}
      <div
        className={cn(
          'rounded-xl border border-gray-200 bg-white overflow-hidden transition-opacity',
          isFetching && 'opacity-60',
        )}
        aria-busy={isFetching}
      >
        {isLoading && <AdminSpinner />}

        {isError && (
          <AdminError message="Failed to load reports." onRetry={() => refetch()} />
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="text-center py-16">
            <BarChart2 className="mx-auto w-10 h-10 text-gray-300 mb-3" aria-hidden="true" />
            {hasActiveFilters ? (
              <>
                <p className="text-sm text-gray-500 font-medium">No reports match your filters.</p>
                <button
                  type="button"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="mt-2 text-xs text-amber-600 hover:underline"
                >
                  Clear all filters
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-400">No reports found.</p>
            )}
          </div>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <AdminReportsTable
            reports={items}
            onSelect={setSelectedId}
            selectedId={selectedId}
          />
        )}
      </div>

      {/* Pagination */}
      {total > filters.pageSize && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {(filters.page - 1) * filters.pageSize + 1}-{Math.min(filters.page * filters.pageSize, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleFiltersChange({ page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => handleFiltersChange({ page: filters.page + 1 })}
              disabled={filters.page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail panel */}
      <AdminReportDetailPanel
        reportId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}
