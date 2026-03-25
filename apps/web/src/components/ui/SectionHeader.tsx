import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface SectionHeaderProps {
  title: string
  description?: string
  /** Optional action button / element placed on the right */
  action?: ReactNode
  className?: string
}

/**
 * SectionHeader — secondary heading used inside a page to divide logical
 * content sections. Not to be confused with PageLayout which owns the top-level
 * page title.
 *
 * @example
 *   <SectionHeader
 *     title="Security settings"
 *     description="Manage two-factor authentication and recovery options."
 *     action={<Button size="sm">Edit</Button>}
 *   />
 */
export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div>
        <h2 className="text-base font-semibold text-gray-900 leading-snug">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-gray-500 leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
