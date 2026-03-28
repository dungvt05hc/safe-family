import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

/** Amber spinner rendered inside a panel or table container while data loads. */
export function AdminSpinner() {
  return (
    <div className="flex justify-center py-16" role="status" aria-label="Loading">
      <span
        className="h-7 w-7 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"
        aria-hidden="true"
      />
    </div>
  )
}

/** Inline error state. Wraps content in a `role="alert"` region. */
export function AdminError({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-red-600">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
        {message}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-medium text-red-600 underline hover:text-red-700"
        >
          Try again
        </button>
      )}
    </div>
  )
}

/** Empty-state illustration rendered inside panels or table areas. */
export function AdminEmpty({
  icon,
  message = 'No data yet.',
}: {
  icon?: ReactNode
  message?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="mb-3 text-gray-300" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  )
}
