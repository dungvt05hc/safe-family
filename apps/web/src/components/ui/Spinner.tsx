import { cn } from '@/lib/utils'

export type SpinnerSize = 'sm' | 'md' | 'lg'

const SIZE_STYLES: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-4',
}

export interface SpinnerProps {
  size?: SpinnerSize
  className?: string
}

/**
 * Spinner — animated loading indicator.
 *
 * @example
 *   <Spinner />
 *   <Spinner size="sm" className="text-white" />
 */
export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'animate-spin rounded-full border-blue-600 border-t-transparent',
        SIZE_STYLES[size],
        className,
      )}
    />
  )
}

// ─── Centered loading state ───────────────────────────────────────────────────

/** Full-width centred spinner — drop into any content area while loading */
export function LoadingState({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-16', className)}>
      <Spinner />
    </div>
  )
}
