import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { AdminSpinner, AdminError, AdminEmpty } from '../components/AdminStateViews'
import { AdminBookingFiltersBar } from '../bookings/AdminBookingFilters'
import { AdminBookingsTable } from '../bookings/AdminBookingsTable'
import { AdminBookingDetailDrawer } from '../bookings/AdminBookingDetailDrawer'
import {
  useAdminBookingsList,
  useUpdateBookingStatus,
  useUpdateBookingPaymentStatus,
  useAssignBooking,
} from '../bookings/adminBookings.hooks'
import type { AdminBookingFilters, BookingStatus, PaymentStatus } from '../bookings/adminBookings.types'

const DEFAULT_FILTERS: AdminBookingFilters = {
  search: '',
  quickFilter: '',
  status: '',
  paymentStatus: '',
  channel: '',
  source: '',
  packageId: '',
  from: '',
  to: '',
  page: 1,
  pageSize: 25,
}

export function AdminBookingsPage() {
  const [filters, setFilters] = useState<AdminBookingFilters>(DEFAULT_FILTERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading, isFetching, isError, refetch } = useAdminBookingsList(filters)
  const updateStatus        = useUpdateBookingStatus()
  const updatePaymentStatus = useUpdateBookingPaymentStatus()
  const assignBooking       = useAssignBooking()

  const isMutating =
    updateStatus.isPending ||
    updatePaymentStatus.isPending ||
    assignBooking.isPending

  function handleFiltersChange(next: Partial<AdminBookingFilters>) {
    setFilters((prev) => ({ ...prev, ...next }))
  }

  function handleStatusChange(id: string, status: BookingStatus) {
    updateStatus.mutate({ id, status })
  }

  function handlePaymentStatusChange(id: string, status: PaymentStatus) {
    updatePaymentStatus.mutate({ id, status })
  }

  function handleAssign(id: string, adminId: string | null, adminEmail: string | null) {
    assignBooking.mutate({ id, req: { assignedAdminId: adminId, assignedAdminEmail: adminEmail } })
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / filters.pageSize)) : 1
  const hasActiveFilters =
    filters.search !== '' ||
    filters.quickFilter !== '' ||
    filters.status !== '' ||
    filters.paymentStatus !== '' ||
    filters.channel !== '' ||
    filters.source !== '' ||
    filters.packageId !== '' ||
    filters.from !== '' ||
    filters.to !== ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5" aria-live="polite" aria-atomic="true">
            {data ? `${data.total.toLocaleString()} total` : '\u00A0'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <AdminBookingFiltersBar filters={filters} onChange={handleFiltersChange} />
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
          <AdminError message="Failed to load bookings." onRetry={() => refetch()} />
        ) : !data || data.items.length === 0 ? (
          <AdminEmpty
            icon={<CalendarDays className="w-10 h-10" />}
            message={hasActiveFilters ? 'No bookings match your filters.' : 'No bookings yet.'}
          />
        ) : (
          <AdminBookingsTable
            bookings={data.items}
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
            {data.total.toLocaleString()} {data.total === 1 ? 'booking' : 'bookings'}
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
      <AdminBookingDetailDrawer
        bookingId={selectedId}
        onClose={() => setSelectedId(null)}
        onStatusChange={handleStatusChange}
        onPaymentStatusChange={handlePaymentStatusChange}
        onAssign={handleAssign}
        isMutating={isMutating}
      />
    </div>
  )
}

