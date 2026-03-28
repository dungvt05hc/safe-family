import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { REPORT_TYPE_LABELS } from '../admin.badges'
import type { AdminReportFiltersState, ReportType } from './adminReports.types'

interface Props {
  filters: AdminReportFiltersState
  onChange: (next: Partial<AdminReportFiltersState>) => void
}

const TYPE_OPTIONS: { value: ReportType | ''; label: string }[] = [
  { value: '', label: 'All types' },
  ...(Object.entries(REPORT_TYPE_LABELS) as [ReportType, string][]).map(([value, label]) => ({
    value,
    label,
  })),
]

const selectClass =
  'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400'

const DEBOUNCE_MS = 350

export function AdminReportFiltersBar({ filters, onChange }: Props) {
  const [searchInput, setSearchInput] = useState(filters.search)
  const sentSearch = useRef(filters.search)

  // Sync local input when parent resets filters externally.
  useEffect(() => {
    if (filters.search !== sentSearch.current) {
      sentSearch.current = filters.search
      setSearchInput(filters.search)
    }
  }, [filters.search])

  // Debounce search.
  useEffect(() => {
    if (searchInput === sentSearch.current) return
    const id = setTimeout(() => {
      sentSearch.current = searchInput
      onChange({ search: searchInput, page: 1 })
    }, DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [searchInput, onChange])

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 min-w-[220px]">
        <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
        <input
          type="search"
          aria-label="Search reports"
          placeholder="Search by title or family…"
          value={searchInput}
          onChange={(e) => { setSearchInput(e.target.value); }}
          className="flex-1 bg-transparent outline-none placeholder:text-gray-400 text-gray-800"
        />
      </div>

      {/* Report type */}
      <div>
        <label htmlFor="report-type-filter" className="sr-only">Filter by report type</label>
        <select
          id="report-type-filter"
          value={filters.reportType}
          onChange={(e) => onChange({ reportType: e.target.value as ReportType | '', page: 1 })}
          className={selectClass}
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Date from */}
      <div>
        <label htmlFor="report-from-filter" className="sr-only">From date</label>
        <input
          id="report-from-filter"
          type="date"
          aria-label="From date"
          value={filters.from}
          max={filters.to || undefined}
          onChange={(e) => onChange({ from: e.target.value, page: 1 })}
          className={selectClass}
        />
      </div>

      {/* Date to */}
      <div>
        <label htmlFor="report-to-filter" className="sr-only">To date</label>
        <input
          id="report-to-filter"
          type="date"
          aria-label="To date"
          value={filters.to}
          min={filters.from || undefined}
          onChange={(e) => onChange({ to: e.target.value, page: 1 })}
          className={selectClass}
        />
      </div>

      {/* Clear */}
      {(filters.search || filters.reportType || filters.from || filters.to) && (
        <button
          type="button"
          onClick={() => onChange({ search: '', reportType: '', from: '', to: '', page: 1 })}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
