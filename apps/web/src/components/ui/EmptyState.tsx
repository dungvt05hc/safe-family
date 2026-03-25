import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface EmptyStateProps {
  /** Lucide icon component */
  icon: LucideIcon
  /** Short, bold headline */
  title: string
  /** One-or-two sentence description */
  description: string
  /** Primary CTA label */
  actionLabel?: string
  /** Called when the CTA is clicked */
  onAction?: () => void
  /** Optionally override the icon container colour (Tailwind bg + text classes) */
  iconColor?: string
  /** Extra wrapper class */
  className?: string
}

/**
 * EmptyState — a reusable, accessible empty-content placeholder.
 *
 * Usage:
 *   <EmptyState
 *     icon={Users}
 *     title="No family members yet"
 *     description="Add the people in your family to start tracking their digital safety."
 *     actionLabel="Add Member"
 *     onAction={() => setShowAdd(true)}
 *   />
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  iconColor = 'bg-blue-50 text-blue-500',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-8 py-14 text-center',
        className,
      )}
    >
      {/* Icon bubble */}
      <div
        className={cn(
          'mb-4 flex items-center justify-center w-14 h-14 rounded-2xl',
          iconColor,
        )}
        aria-hidden="true"
      >
        <Icon className="w-7 h-7" strokeWidth={1.5} />
      </div>

      {/* Text */}
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed">{description}</p>

      {/* CTA */}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
