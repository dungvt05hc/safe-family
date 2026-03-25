import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DEFAULT_REPORT_FILTERS,
  REPORT_TYPE_FILTER_OPTIONS,
  type ReportFilters,
  type ReportTypeFilter,
} from '../reports.types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReportFiltersProps {
  filters:   ReportFilters
  onChange:  (f: ReportFilters) => void
  itemCount: number
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ReportFilters({ filters, onChange, itemCount }: ReportFiltersProps) {
  const isFiltered =
    filters.search   !== '' ||
    filters.type     !== 'All' ||
    filters.dateFrom !== '' ||
    filters.dateTo   !== ''

  function set<K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        {/* Search */}
        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Search
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={filters.search}
              onChange={(e) => set('search', e.target.value)}
              placeholder="Filter by title…"
              className={cn(
                'h-9 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 text-sm text-gray-700',
                'placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200',
                'transition-colors',
              )}
            />
          </div>
        </div>

        {/* Type */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => set('type', e.target.value as ReportTypeFilter)}
            className={cn(
              'h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700',
              'focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors cursor-pointer',
            )}
          >
            {REPORT_TYPE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Date from */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            From
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => set('dateFrom', e.target.value)}
            className={cn(
              'h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700',
              'focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors',
            )}
          />
        </div>

        {/* Date to */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            To
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => set('dateTo', e.target.value)}
            className={cn(
              'h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700',
              'focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors',
            )}
          />
        </div>

        {/* Clear + count */}
        <div className="flex items-end gap-3 pb-0.5">
          {isFiltered && (
            <button
              onClick={() => onChange(DEFAULT_REPORT_FILTERS)}
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 h-9 text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
            >
              <X className="w-3 h-3" aria-hidden="true" />
              Clear
            </button>
          )}
          <p className="text-xs text-gray-400 whitespace-nowrap">
            {itemCount} report{itemCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  )
}
