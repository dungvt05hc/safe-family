import { Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  DEFAULT_TASK_FILTERS,
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

export function SafetyTaskFilters({ filters, onChange, itemCount }: SafetyTaskFiltersProps) {
  const { t } = useTranslation('tasks')
  const update = (partial: Partial<SafetyTaskFilters>) =>
    onChange({ ...filters, ...partial })

  const statusOptions: { value: TaskStatusFilter; label: string }[] = [
    { value: 'All',        label: t('filter.allStatuses') },
    { value: 'Pending',    label: t('status.Pending') },
    { value: 'InProgress', label: t('status.InProgress') },
    { value: 'Completed',  label: t('status.Completed') },
    { value: 'Dismissed',  label: t('status.Dismissed') },
  ]

  const priorityOptions: { value: TaskPriorityFilter; label: string }[] = [
    { value: 'All',    label: t('filter.allPriorities') },
    { value: 'High',   label: t('priority.High') },
    { value: 'Medium', label: t('priority.Medium') },
    { value: 'Low',    label: t('priority.Low') },
  ]

  const phaseOptions: { value: TaskPhaseFilter; label: string }[] = [
    { value: 'All',        label: t('filter.allPhases') },
    { value: 'Immediate',  label: t('phase.Immediate') },
    { value: 'Next7Days',  label: t('phase.Next7Days') },
    { value: 'Next30Days', label: t('phase.Next30Days') },
    { value: 'Ongoing',    label: t('phase.Ongoing') },
    { value: 'Recurring',  label: t('phase.Recurring') },
  ]

  const categoryOptions: { value: TaskCategoryFilter; label: string }[] = [
    { value: 'All',             label: t('filter.allCategories') },
    { value: 'AccountSecurity', label: t('category.AccountSecurity') },
    { value: 'DeviceHygiene',   label: t('category.DeviceHygiene') },
    { value: 'PrivacySharing',  label: t('category.PrivacySharing') },
    { value: 'BackupRecovery',  label: t('category.BackupRecovery') },
    { value: 'ScamReadiness',   label: t('category.ScamReadiness') },
    { value: 'NetworkSecurity', label: t('category.NetworkSecurity') },
    { value: 'FamilySafety',    label: t('category.FamilySafety') },
  ]

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
          {t('filter.searchLabel')}
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder={t('filter.searchPlaceholder')}
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
          label={t('filter.statusLabel')}
          value={filters.status}
          options={statusOptions}
          onChange={(v) => update({ status: v })}
        />
        <FilterSelect
          label={t('filter.priorityLabel')}
          value={filters.priority}
          options={priorityOptions}
          onChange={(v) => update({ priority: v })}
        />
        <FilterSelect
          label={t('filter.phaseLabel')}
          value={filters.phase}
          options={phaseOptions}
          onChange={(v) => update({ phase: v })}
        />
        <FilterSelect
          label={t('filter.categoryLabel')}
          value={filters.category}
          options={categoryOptions}
          onChange={(v) => update({ category: v })}
        />

        {/* Count + clear */}
        <div className="flex items-end gap-2 ml-auto">
          <span className="text-xs text-gray-400 pb-1">
            {t('filter.taskCount', { count: itemCount })}
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={() => onChange(DEFAULT_TASK_FILTERS)}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 pb-1 transition-colors"
            >
              <X className="w-3 h-3" />
              {t('filter.clearFilters')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
