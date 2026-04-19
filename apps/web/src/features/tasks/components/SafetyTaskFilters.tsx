import { Search, X } from 'lucide-react'
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

interface SafetyTaskFiltersProps {
  filters:   SafetyTaskFilters
  onChange:  (filters: SafetyTaskFilters) => void
  itemCount: number
}

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
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

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

export function SafetyTaskFilters({ filters, onChange, itemCount }: SafetyTaskFiltersProps) {
  const update = (partial: Partial<SafetyTaskFilters>) =>
    onChange({ ...filters, ...partial })

  const isFiltered =
    filters.search !== '' ||
    filters.status   !== 'All' ||
    filters.priority !== 'All' ||
    filters.phase    !== 'All' ||
    filters.category !== 'All'

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3">
      {/* Search */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks…"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className={cn(
              'w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700',
              'placeholder:text-gray-400',
              'focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200',
              'transition-colors',
            )}
          />
        </div>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-3">
        <FilterSelect
          label="Status"
          value={filters.status}
          options={STATUS_OPTIONS}
          onChange={(v) => update({ status: v })}
        />
        <FilterSelect
          label="Priority"
          value={filters.priority}
          options={PRIORITY_OPTIONS}
          onChange={(v) => update({ priority: v })}
        />
        <FilterSelect
          label="Phase"
          value={filters.phase}
          options={PHASE_OPTIONS}
          onChange={(v) => update({ phase: v })}
        />
        <FilterSelect
          label="Category"
          value={filters.category}
          options={CATEGORY_OPTIONS}
          onChange={(v) => update({ category: v })}
        />

        {/* Count + clear */}
        <div className="flex items-end gap-2 ml-auto">
          <span className="text-xs text-gray-400 pb-1">
            {itemCount} {itemCount === 1 ? 'task' : 'tasks'}
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={() => onChange(DEFAULT_TASK_FILTERS)}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 pb-1 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
