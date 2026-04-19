import { Search, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CATEGORY_LABEL,
  DEFAULT_TASK_FILTERS,
  PHASE_LABEL,
  PRIORITY_LABEL,
  STATUS_LABEL,
  type SafetyTaskFilters,
  type TaskCategoryFilter,
  type TaskPhaseFilter,
  type TaskPriorityFilter,
  type TaskStatusFilter,
} from '../safety-tasks.types'

// ── Filter select ─────────────────────────────────────────────────────────────

interface FilterSelectProps<T extends string> {
  label:    string
  value:    T
  options:  { value: T; label: string }[]
  onChange: (value: T) => void
}

function FilterSelect<T extends string>({ label, value, options, onChange }: FilterSelectProps<T>) {
  return (
    <div className="flex flex-col gap-1 min-w-[130px]">
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
          value !== 'All' && 'border-blue-400 bg-blue-50 text-blue-700 font-medium',
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

// ── Option constants ──────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: TaskStatusFilter; label: string }[] = [
  { value: 'All',        label: 'All statuses' },
  { value: 'Pending',    label: STATUS_LABEL.Pending },
  { value: 'InProgress', label: STATUS_LABEL.InProgress },
  { value: 'Completed',  label: STATUS_LABEL.Completed },
  { value: 'Dismissed',  label: STATUS_LABEL.Dismissed },
]

const PRIORITY_OPTIONS: { value: TaskPriorityFilter; label: string }[] = [
  { value: 'All',    label: 'All priorities' },
  { value: 'High',   label: PRIORITY_LABEL.High },
  { value: 'Medium', label: PRIORITY_LABEL.Medium },
  { value: 'Low',    label: PRIORITY_LABEL.Low },
]

const PHASE_OPTIONS: { value: TaskPhaseFilter; label: string }[] = [
  { value: 'All',        label: 'All phases' },
  { value: 'Immediate',  label: PHASE_LABEL.Immediate },
  { value: 'Next7Days',  label: PHASE_LABEL.Next7Days },
  { value: 'Next30Days', label: PHASE_LABEL.Next30Days },
  { value: 'Ongoing',    label: PHASE_LABEL.Ongoing },
  { value: 'Recurring',  label: PHASE_LABEL.Recurring },
]

const CATEGORY_OPTIONS: { value: TaskCategoryFilter; label: string }[] = [
  { value: 'All', label: 'All categories' },
  ...Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label })),
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface ChecklistFiltersProps {
  filters:   SafetyTaskFilters
  onChange:  (filters: SafetyTaskFilters) => void
  /** Number of tasks currently visible after filtering */
  itemCount: number
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ChecklistFilters({ filters, onChange, itemCount }: ChecklistFiltersProps) {
  const update = (partial: Partial<SafetyTaskFilters>) =>
    onChange({ ...filters, ...partial })

  const isFiltered =
    filters.search   !== '' ||
    filters.status   !== 'All' ||
    filters.priority !== 'All' ||
    filters.phase    !== 'All' ||
    filters.category !== 'All'

  const activeFilterCount = [
    filters.search   !== '',
    filters.status   !== 'All',
    filters.priority !== 'All',
    filters.phase    !== 'All',
    filters.category !== 'All',
  ].filter(Boolean).length

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3">
      {/* Header row */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
          <span className="text-xs font-semibold text-gray-600">
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </span>
          <span className="text-xs text-gray-400">
            · {itemCount} task{itemCount !== 1 ? 's' : ''}
          </span>
        </div>
        {isFiltered && (
          <button
            onClick={() => onChange(DEFAULT_TASK_FILTERS)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Search tasks…"
          className={cn(
            'h-9 w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700',
            'placeholder:text-gray-400',
            'focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200',
            'transition-colors',
          )}
        />
      </div>

      {/* Selects row */}
      <div className="flex flex-wrap gap-3">
        <FilterSelect
          label="Status"
          value={filters.status}
          options={STATUS_OPTIONS}
          onChange={(status) => update({ status })}
        />
        <FilterSelect
          label="Priority"
          value={filters.priority}
          options={PRIORITY_OPTIONS}
          onChange={(priority) => update({ priority })}
        />
        <FilterSelect
          label="Phase"
          value={filters.phase}
          options={PHASE_OPTIONS}
          onChange={(phase) => update({ phase })}
        />
        <FilterSelect
          label="Category"
          value={filters.category}
          options={CATEGORY_OPTIONS}
          onChange={(category) => update({ category })}
        />
      </div>
    </div>
  )
}
