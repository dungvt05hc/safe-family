import { useId } from 'react'
import { X } from 'lucide-react'
import { ACTIVITY_ACTIONS } from './adminActivity.types'

interface AdminActivityFiltersProps {
  action: string
  from: string
  to: string
  onActionChange: (value: string) => void
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onClear: () => void
}

export function AdminActivityFilters({
  action,
  from,
  to,
  onActionChange,
  onFromChange,
  onToChange,
  onClear,
}: AdminActivityFiltersProps) {
  const id = useId()
  const hasFilters = action !== '' || from !== '' || to !== ''

  return (
    <div
      role="search"
      aria-label="Activity filters"
      className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4 shadow-sm"
    >
      {/* Activity type */}
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-action`} className="text-xs font-medium text-gray-600">
          Activity Type
        </label>
        <select
          id={`${id}-action`}
          value={action}
          onChange={(e) => onActionChange(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
        >
          <option value="">All activities</option>
          {ACTIVITY_ACTIONS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date from */}
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-from`} className="text-xs font-medium text-gray-600">
          From
        </label>
        <input
          id={`${id}-from`}
          type="date"
          value={from}
          max={to || undefined}
          onChange={(e) => onFromChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
      </div>

      {/* Date to */}
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-to`} className="text-xs font-medium text-gray-600">
          To
        </label>
        <input
          id={`${id}-to`}
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => onToChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
      </div>

      {/* Clear button */}
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Clear
        </button>
      )}
    </div>
  )
}
