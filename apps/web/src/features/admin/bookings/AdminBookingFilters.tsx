import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { useAdminServicePackages } from '../hooks/useAdminQueries'
import type { AdminBookingFilters, BookingStatus, BookingChannel } from './adminBookings.types'

interface Props {
  filters: AdminBookingFilters
  onChange: (next: Partial<AdminBookingFilters>) => void
}

const BOOKING_STATUSES: { value: BookingStatus | ''; label: string }[] = [
  { value: '',           label: 'All statuses' },
  { value: 'Pending',    label: 'Pending' },
  { value: 'Confirmed',  label: 'Confirmed' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'Completed',  label: 'Completed' },
  { value: 'Cancelled',  label: 'Cancelled' },
]

const BOOKING_CHANNELS: { value: BookingChannel | ''; label: string }[] = [
  { value: '',       label: 'All channels' },
  { value: 'Online', label: 'Online' },
  { value: 'Phone',  label: 'Phone' },
  { value: 'Email',  label: 'Email' },
  { value: 'Onsite', label: 'Onsite' },
]

const selectClass =
  'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400'

const DEBOUNCE_MS = 350

export function AdminBookingFiltersBar({ filters, onChange }: Props) {
  const { data: packages } = useAdminServicePackages()

  const [searchInput, setSearchInput] = useState(filters.search)
  const sentSearch = useRef(filters.search)

  // Sync local input when parent resets filters externally.
  useEffect(() => {
    if (filters.search !== sentSearch.current) {
      sentSearch.current = filters.search
      setSearchInput(filters.search)
    }
  }, [filters.search])

  // Debounce: propagate to parent only after the user pauses typing.
  useEffect(() => {
    if (searchInput === sentSearch.current) return
    const id = setTimeout(() => {
      sentSearch.current = searchInput
      onChange({ search: searchInput, page: 1 })
    }, DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [searchInput]) // onChange intentionally excluded — parent ref is stable

  return (
    <>
    <div role="search" aria-label="Booking filters" className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 w-72">
        <Search className="w-4 h-4 shrink-0 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          aria-label="Search bookings"
          placeholder="Search by family or package…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 bg-transparent outline-none placeholder:text-gray-400 text-gray-800 text-sm"
        />
      </div>

      {/* Booking Status */}
      <select
        aria-label="Filter by booking status"
        value={filters.status}
        onChange={(e) => onChange({ status: e.target.value as BookingStatus | '', page: 1 })}
        className={selectClass}
      >
        {BOOKING_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {/* Channel */}
      <select
        aria-label="Filter by channel"
        value={filters.channel}
        onChange={(e) => onChange({ channel: e.target.value as BookingChannel | '', page: 1 })}
        className={selectClass}
      >
        {BOOKING_CHANNELS.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>

      {/* Package */}
      <select
        aria-label="Filter by package"
        value={filters.packageId}
        onChange={(e) => onChange({ packageId: e.target.value, page: 1 })}
        className={selectClass}
      >
        <option value="">All packages</option>
        {packages?.map((pkg) => (
          <option key={pkg.id} value={pkg.id}>{pkg.title}</option>
        ))}
      </select>

      {/* From date */}
      <label className={`${selectClass} flex items-center gap-1.5 cursor-pointer`}>
        <span className="text-xs text-gray-400 shrink-0 select-none">From</span>
        <input
          type="date"
          value={filters.from}
          onChange={(e) => onChange({ from: e.target.value, page: 1 })}
          className="bg-transparent outline-none text-sm text-gray-700 min-w-0"
        />
      </label>

      {/* To date */}
      <label className={`${selectClass} flex items-center gap-1.5 cursor-pointer`}>
        <span className="text-xs text-gray-400 shrink-0 select-none">To</span>
        <input
          type="date"
          value={filters.to}
          onChange={(e) => onChange({ to: e.target.value, page: 1 })}
          className="bg-transparent outline-none text-sm text-gray-700 min-w-0"
        />
      </label>
    </div>

    {filters.from && filters.to && filters.from > filters.to && (
      <p role="alert" className="text-xs text-red-500 px-1">
        &ldquo;From&rdquo; date must be earlier than &ldquo;To&rdquo; date.
      </p>
    )}
    </>
  )
}
