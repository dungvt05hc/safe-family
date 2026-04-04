import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminServicePackages } from '../hooks/useAdminQueries'
import type {
  AdminBookingFilters,
  BookingQuickFilter,
  BookingChannel,
  BookingSource,
} from './adminBookings.types'

interface Props {
  filters: AdminBookingFilters
  onChange: (next: Partial<AdminBookingFilters>) => void
}

const QUICK_FILTERS: { value: BookingQuickFilter | ''; label: string; short: string }[] = [
  { value: '',                label: 'All',                    short: 'All' },
  { value: 'PendingPayment',  label: 'Awaiting Payment',       short: 'Awaiting Pymt' },
  { value: 'PaidNotConfirmed',label: 'Paid \u2014 Unconfirmed', short: 'Paid/Unconf.' },
  { value: 'Confirmed',       label: 'Confirmed',              short: 'Confirmed' },
  { value: 'Scheduled',       label: 'Scheduled',              short: 'Scheduled' },
  { value: 'InProgress',      label: 'In Progress',            short: 'In Progress' },
  { value: 'Completed',       label: 'Completed',              short: 'Completed' },
  { value: 'Cancelled',       label: 'Cancelled',              short: 'Cancelled' },
  { value: 'Expired',         label: 'Expired',                short: 'Expired' },
]

const QUICK_FILTER_COLORS: Record<BookingQuickFilter | '', string> = {
  '':               'border-amber-400 bg-amber-400 text-white',
  PendingPayment:   'border-amber-400 bg-amber-400 text-white',
  PaidNotConfirmed: 'border-blue-500 bg-blue-500 text-white',
  Confirmed:        'border-indigo-500 bg-indigo-500 text-white',
  Scheduled:        'border-purple-500 bg-purple-500 text-white',
  InProgress:       'border-orange-500 bg-orange-500 text-white',
  Completed:        'border-green-600 bg-green-600 text-white',
  Cancelled:        'border-red-500 bg-red-500 text-white',
  Expired:          'border-gray-500 bg-gray-500 text-white',
}

const QUICK_FILTER_INACTIVE =
  'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'

const SOURCES: { value: BookingSource | ''; label: string }[] = [
  { value: '',                   label: 'All sources' },
  { value: 'Direct',             label: 'Direct' },
  { value: 'IncidentFollowUp',   label: 'Incident follow-up' },
  { value: 'AssessmentFollowUp', label: 'Assessment follow-up' },
  { value: 'AdminCreated',       label: 'Admin created' },
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

  // Debounce search propagation.
  useEffect(() => {
    if (searchInput === sentSearch.current) return
    const id = setTimeout(() => {
      sentSearch.current = searchInput
      onChange({ search: searchInput, page: 1 })
    }, DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [searchInput]) // onChange intentionally excluded — parent ref is stable

  return (
    <div className="space-y-3 w-full">
      {/* ── Quick filter pills ─────────────────────────────────────────────── */}
      <div
        role="group"
        aria-label="Quick filters"
        className="flex flex-wrap gap-1.5"
      >
        {QUICK_FILTERS.map((f) => {
          const active = filters.quickFilter === f.value
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => onChange({ quickFilter: f.value, status: '', page: 1 })}
              aria-pressed={active}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
                active ? QUICK_FILTER_COLORS[f.value] : QUICK_FILTER_INACTIVE,
              )}
            >
              {f.short}
            </button>
          )
        })}
      </div>

      {/* ── Detailed filters row ───────────────────────────────────────────── */}
      <div role="search" aria-label="Booking filters" className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 w-64">
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

        {/* Source */}
        <select
          aria-label="Filter by source"
          value={filters.source}
          onChange={(e) => onChange({ source: e.target.value as BookingSource | '', page: 1 })}
          className={selectClass}
        >
          {SOURCES.map((s) => (
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
    </div>
  )
}
