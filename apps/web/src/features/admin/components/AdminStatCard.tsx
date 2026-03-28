import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StatCardVariant = 'default' | 'warning' | 'danger' | 'success'

interface AdminStatCardProps {
  label: string
  value: number
  icon: LucideIcon
  variant?: StatCardVariant
  /** Optional sub-label shown below the value (e.g. context description). */
  sub?: string
}

const variantStyles: Record<StatCardVariant, { card: string; icon: string; value: string }> = {
  default: {
    card:  'border-gray-200 bg-white',
    icon:  'bg-gray-100 text-gray-500',
    value: 'text-gray-900',
  },
  warning: {
    card:  'border-amber-200 bg-amber-50',
    icon:  'bg-amber-100 text-amber-600',
    value: 'text-amber-700',
  },
  danger: {
    card:  'border-red-200 bg-red-50',
    icon:  'bg-red-100 text-red-600',
    value: 'text-red-700',
  },
  success: {
    card:  'border-green-200 bg-green-50',
    icon:  'bg-green-100 text-green-600',
    value: 'text-green-700',
  },
}

export function AdminStatCard({ label, value, icon: Icon, variant = 'default', sub }: AdminStatCardProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={cn('flex items-center gap-4 rounded-xl border p-5 shadow-sm', styles.card)}
      role="figure"
      aria-label={`${label}: ${value.toLocaleString()}`}
    >
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', styles.icon)}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <p className={cn('mt-0.5 text-2xl font-bold tabular-nums', styles.value)}>{value.toLocaleString()}</p>
        {sub && <p className="mt-0.5 truncate text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}
