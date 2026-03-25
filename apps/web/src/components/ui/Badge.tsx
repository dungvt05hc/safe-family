import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple'

// ─── Style map ───────────────────────────────────────────────────────────────

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  success: 'bg-green-100  text-green-700',
  warning: 'bg-amber-100  text-amber-700',
  danger:  'bg-red-100    text-red-700',
  info:    'bg-blue-100   text-blue-700',
  neutral: 'bg-gray-100   text-gray-600',
  purple:  'bg-violet-100 text-violet-700',
}

// ─── Component ───────────────────────────────────────────────────────────────

export interface BadgeProps {
  variant?: BadgeVariant
  /** Show a coloured leading dot */
  dot?: boolean
  /** Extra class — can override background/text for one-off colours */
  className?: string
  children: ReactNode
}

/**
 * Badge — compact status/label pill.
 *
 * @example
 *   <Badge variant="success">Enabled</Badge>
 *   <Badge variant="warning" dot>Pending</Badge>
 *   <Badge variant="danger">Critical</Badge>
 */
export function Badge({ variant = 'neutral', dot = false, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" aria-hidden="true" />}
      {children}
    </span>
  )
}
