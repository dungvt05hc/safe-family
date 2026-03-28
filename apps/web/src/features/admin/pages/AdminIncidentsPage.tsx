import { useState } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { AdminSpinner, AdminError, AdminEmpty } from '../components/AdminStateViews'
import { AdminIncidentFiltersBar } from '../incidents/AdminIncidentFilters'
import { AdminIncidentsTable } from '../incidents/AdminIncidentsTable'
import { AdminIncidentDetailDrawer } from '../incidents/AdminIncidentDetailDrawer'
import {
  useAdminIncidentsList,
  useUpdateIncidentStatus,
} from '../incidents/adminIncidents.hooks'
import type { AdminIncidentFiltersState, IncidentStatus } from '../incidents/adminIncidents.types'

const DEFAULT_FILTERS: AdminIncidentFiltersState = {
  search: '',
  severity: '',
  status: '',
  type: '',
  from: '',
  to: '',
  page: 1,
  pageSize: 25,
}

export function AdminIncidentsPage() {
  const [filters, setFilters] = useState<AdminIncidentFiltersState>(DEFAULT_FILTERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading, isFetching, isError, refetch } = useAdminIncidentsList(filters)
  const updateStatus = useUpdateIncidentStatus()

  const isMutating = updateStatus.isPending

  function handleFiltersChange(next: Partial<AdminIncidentFiltersState>) {
    setFilters((prev) => ({ ...prev, ...next }))
  }

  function handleStatusChange(id: string, status: IncidentStatus) {
    updateStatus.mutate({ id, status })
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / filters.pageSize)) : 1
  const hasActiveFilters =
    filters.search !== '' ||
    filters.severity !== '' ||
    filters.status !== '' ||
    filters.type !== '' ||
    filters.from !== '' ||
    filters.to !== ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
          <p className="text-sm text-gray-500 mt-0.5" aria-live="polite" aria-atomic="true">
            {data ? `${data.total.toLocaleString()} total` : '\u00A0'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <AdminIncidentFiltersBar filters={filters} onChange={handleFiltersChange} />
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="text-sm font-medium text-amber-600 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto rounded-lg border bg-white shadow-sm transition-opacity duration-200"
        aria-busy={isFetching}
        style={{ opacity: isFetching && !isLoading ? 0.6 : 1 }}
      >
        {isLoading ? (
          <AdminSpinner />
        ) : isError ? (
          <AdminError message="Failed to load incidents." onRetry={() => refetch()} />
        ) : !data || data.items.length === 0 ? (
          <AdminEmpty
            icon={<AlertTriangle className="w-10 h-10" />}
            message={hasActiveFilters ? 'No incidents match your filters.' : 'No incidents yet.'}
          />
        ) : (
          <AdminIncidentsTable
            incidents={data.items}
            onOpen={setSelectedId}
            onStatusChange={handleStatusChange}
            isMutating={isMutating}
          />
        )}
      </div>

      {/* Pagination */}
      {data && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {totalPages > 1 ? `Page ${filters.page} of ${totalPages} \u2014 ` : ''}
            {data.total.toLocaleString()} {data.total === 1 ? 'incident' : 'incidents'}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={filters.page <= 1}
                onClick={() => handleFiltersChange({ page: filters.page - 1 })}
                aria-label="Previous page"
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                Prev
              </button>
              <button
                type="button"
                disabled={filters.page >= totalPages}
                onClick={() => handleFiltersChange({ page: filters.page + 1 })}
                aria-label="Next page"
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Detail drawer */}
      <AdminIncidentDetailDrawer
        incidentId={selectedId}
        onClose={() => setSelectedId(null)}
        onStatusChange={handleStatusChange}
        isMutating={isMutating}
      />
    </div>
  )
}
