import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { useAdminServicePackages } from '../hooks/useAdminQueries'
import type { AdminCustomerFilters, RiskLevel } from './adminCustomers.types'

interface Props {
  filters: AdminCustomerFilters
  onChange: (next: Partial<AdminCustomerFilters>) => void
}

const RISK_LEVELS: { value: RiskLevel | ''; label: string }[] = [
  { value: '',         label: 'All risk levels' },
  { value: 'Low',      label: 'Low' },
  { value: 'Medium',   label: 'Medium' },
  { value: 'High',     label: 'High' },
  { value: 'Critical', label: 'Critical' },
]

const selectClass =
  'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400'

const DEBOUNCE_MS = 350

export function AdminCustomerFiltersBar({ filters, onChange }: Props) {
  const { data: packages } = useAdminServicePackages()

  // Keep local input state so the text field feels instant while the query debounces.
  const [searchInput, setSearchInput] = useState(filters.search)
  // Track the last search value we sent upward to avoid feedback loops.
  const sentSearch = useRef(filters.search)

  // Sync local input when the parent resets filters externally (e.g. "Clear filters").
  useEffect(() => {
    if (filters.search !== sentSearch.current) {
      sentSearch.current = filters.search
      setSearchInput(filters.search)
    }
  }, [filters.search])

  // Debounce: propagate search to parent only after the user pauses typing.
  useEffect(() => {
    if (searchInput === sentSearch.current) return
    const id = setTimeout(() => {
      sentSearch.current = searchInput
      onChange({ search: searchInput, page: 1 })
    }, DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [searchInput]) // onChange intentionally excluded — parent ref is stable

  return (
    <div role="search" aria-label="Customer filters" className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 w-72">
        <Search className="w-4 h-4 shrink-0 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          aria-label="Search customers"
          placeholder="Search by family name, owner or phone…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 bg-transparent outline-none placeholder:text-gray-400 text-gray-800 text-sm"
        />
      </div>

      {/* Risk Level */}
      <select
        aria-label="Filter by risk level"
        value={filters.riskLevel}
        onChange={(e) => onChange({ riskLevel: e.target.value as RiskLevel | '', page: 1 })}
        className={selectClass}
      >
        {RISK_LEVELS.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>

      {/* Plan Type */}
      <select
        aria-label="Filter by plan type"
        value={filters.planType}
        onChange={(e) => onChange({ planType: e.target.value, page: 1 })}
        className={selectClass}
      >
        <option value="">All plans</option>
        {packages?.map((pkg) => (
          <option key={pkg.id} value={pkg.title}>{pkg.title}</option>
        ))}
      </select>
    </div>
  )
}
