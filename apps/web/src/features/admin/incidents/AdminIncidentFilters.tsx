import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import {
  INCIDENT_STATUS_LABELS,
  INCIDENT_SEVERITY_COLORS,
  INCIDENT_TYPE_LABELS,
} from '../admin.badges'
import type { AdminIncidentFiltersState, IncidentSeverity, IncidentStatus, IncidentType } from './adminIncidents.types'

interface Props {
  filters: AdminIncidentFiltersState
  onChange: (next: Partial<AdminIncidentFiltersState>) => void
}

// Derive filter options from the badge maps to keep labels in a single source of truth.
const SEVERITY_OPTIONS: { value: IncidentSeverity | ''; label: string }[] = [
  { value: '', label: 'All severities' },
  ...(['Low', 'Medium', 'High', 'Critical'] as IncidentSeverity[]).map((v) => ({
    value: v,
    label: INCIDENT_SEVERITY_COLORS[v] ? v : v, // value kept, label kept consistent
  })),
]

const STATUS_OPTIONS: { value: IncidentStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  ...(['Open', 'InProgress', 'Resolved', 'Dismissed'] as IncidentStatus[]).map((v) => ({
    value: v,
    label: INCIDENT_STATUS_LABELS[v],
  })),
]

const TYPE_OPTIONS: { value: IncidentType | ''; label: string }[] = [
  { value: '', label: 'All types' },
  ...(Object.entries(INCIDENT_TYPE_LABELS) as [IncidentType, string][]).map(([value, label]) => ({
    value,
    label,
  })),
]

const selectClass =
  'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400'

const DEBOUNCE_MS = 350

export function AdminIncidentFiltersBar({ filters, onChange }: Props) {
  const [searchInput, setSearchInput] = useState(filters.search)
  const sentSearch = useRef(filters.search)

  // Sync local input when parent resets filters externally.
  useEffect(() => {
    if (filters.search !== sentSearch.current) {
      sentSearch.current = filters.search
      setSearchInput(filters.search)
    }
  }, [filters.search])

  // Debounce search: propagate to parent only after the user pauses typing.
  useEffect(() => {
    if (searchInput === sentSearch.current) return
    const id = setTimeout(() => {
      sentSearch.current = searchInput
      onChange({ search: searchInput, page: 1 })
    }, DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [searchInput]) // onChange intentionally excluded — parent callback is stable

  return (
    <>
      <div role="search" aria-label="Incident filters" className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 w-72">
          <Search className="w-4 h-4 shrink-0 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search incidents"
            placeholder="Search by family or summary…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 bg-transparent outline-none placeholder:text-gray-400 text-gray-800 text-sm"
          />
        </div>

        {/* Severity */}
        <select
          aria-label="Filter by severity"
          value={filters.severity}
          onChange={(e) => onChange({ severity: e.target.value as IncidentSeverity | '', page: 1 })}
          className={selectClass}
        >
          {SEVERITY_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* Status */}
        <select
          aria-label="Filter by status"
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value as IncidentStatus | '', page: 1 })}
          className={selectClass}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* Type */}
        <select
          aria-label="Filter by type"
          value={filters.type}
          onChange={(e) => onChange({ type: e.target.value as IncidentType | '', page: 1 })}
          className={selectClass}
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* From date */}
        <div className={`${selectClass} flex items-center gap-1.5`}>
          <label htmlFor="filter-incident-from" className="text-xs text-gray-400 shrink-0 select-none cursor-default">
            From
          </label>
          <input
            id="filter-incident-from"
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(e) => onChange({ from: e.target.value, page: 1 })}
            className="bg-transparent outline-none text-sm text-gray-700 min-w-0"
          />
        </div>

        {/* To date */}
        <div className={`${selectClass} flex items-center gap-1.5`}>
          <label htmlFor="filter-incident-to" className="text-xs text-gray-400 shrink-0 select-none cursor-default">
            To
          </label>
          <input
            id="filter-incident-to"
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(e) => onChange({ to: e.target.value, page: 1 })}
            className="bg-transparent outline-none text-sm text-gray-700 min-w-0"
          />
        </div>
      </div>

      {filters.from && filters.to && filters.from > filters.to && (
        <p role="alert" className="text-xs text-red-500 px-1">
          &ldquo;From&rdquo; date must be earlier than &ldquo;To&rdquo; date.
        </p>
      )}
    </>
  )
}

