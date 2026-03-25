import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ALL_CATEGORIES,
  CATEGORY_LABEL,
  DEFAULT_FILTERS,
  PRIORITY_LABEL,
  STATUS_LABEL,
  type CategoryFilter,
  type ChecklistFilters,
  type PriorityFilter,
  type StatusFilter,
} from '../checklist.types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChecklistFiltersProps {
  filters:   ChecklistFilters
  onChange:  (filters: ChecklistFilters) => void
  /** Total visible items after filtering, shown as a count hint */
  itemCount: number
}

// ── Small select helper ───────────────────────────────────────────────────────

interface FilterSelectProps<T extends string> {
  label:    string
  value:    T
  options:  { value: T; label: string }[]
  onChange: (value: T) => void
}

function FilterSelect<T extends string>({ label, value, options, onChange }: FilterSelectProps<T>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(
          'h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700',
          'focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200',
          'transition-colors cursor-pointer',
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// ── Priority options ──────────────────────────────────────────────────────────

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'All', label: 'All severities' },
  { value: '1',   label: PRIORITY_LABEL[1] },
  { value: '2',   label: PRIORITY_LABEL[2] },
  { value: '3',   label: PRIORITY_LABEL[3] },
]

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'All',       label: 'All statuses' },
  { value: 'Pending',   label: STATUS_LABEL['Pending'] },
  { value: 'Completed', label: STATUS_LABEL['Completed'] },
  { value: 'Dismissed', label: STATUS_LABEL['Dismissed'] },
]

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'All', label: 'All categories' },
  ...ALL_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABEL[c] ?? c })),
]

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * ChecklistFilters — search + three selects for filtering the checklist.
 */
export function ChecklistFilters({ filters, onChange, itemCount }: ChecklistFiltersProps) {
  const isFiltered =
    filters.search !== '' ||
    filters.priority !== 'All' ||
    filters.status   !== 'All' ||
    filters.category !== 'All'

  function set<K extends keyof ChecklistFilters>(key: K, value: ChecklistFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
        {/* Search */}
        <div className="flex flex-col gap-1 min-w-[180px] flex-1">
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

        {/* Severity */}
        <FilterSelect<PriorityFilter>
          label="Severity"
          value={filters.priority}
          options={PRIORITY_OPTIONS}
          onChange={(v) => set('priority', v)}
        />

        {/* Status */}
        <FilterSelect<StatusFilter>
          label="Status"
          value={filters.status}
          options={STATUS_OPTIONS}
          onChange={(v) => set('status', v)}
        />

        {/* Category */}
        <FilterSelect<CategoryFilter>
          label="Category"
          value={filters.category}
          options={CATEGORY_OPTIONS}
          onChange={(v) => set('category', v)}
        />

        {/* Clear + count */}
        <div className="flex items-end gap-3 pb-0.5">
          {isFiltered && (
            <button
              onClick={() => onChange(DEFAULT_FILTERS)}
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 h-9 text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
            >
              <X className="w-3 h-3" aria-hidden="true" />
              Clear
            </button>
          )}
          <p className="text-xs text-gray-400 whitespace-nowrap">
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  )
}
