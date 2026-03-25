import { type ReactNode } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AlertVariant = 'error' | 'warning' | 'success' | 'info'

interface AlertConfig {
  Icon: LucideIcon
  wrapperClass: string
  iconClass: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<AlertVariant, AlertConfig> = {
  error:   { Icon: AlertCircle,   wrapperClass: 'border-red-200   bg-red-50   text-red-700',    iconClass: 'text-red-500'    },
  warning: { Icon: AlertTriangle, wrapperClass: 'border-amber-200 bg-amber-50 text-amber-700',  iconClass: 'text-amber-500'  },
  success: { Icon: CheckCircle2,  wrapperClass: 'border-green-200 bg-green-50 text-green-700',  iconClass: 'text-green-500'  },
  info:    { Icon: Info,          wrapperClass: 'border-blue-200  bg-blue-50  text-blue-700',   iconClass: 'text-blue-500'   },
}

// ─── Component ───────────────────────────────────────────────────────────────

export interface AlertProps {
  variant?: AlertVariant
  className?: string
  children: ReactNode
}

/**
 * Alert — inline notification banner.
 *
 * @example
 *   <Alert variant="error">Failed to load data. Please refresh.</Alert>
 *   <Alert variant="success">Changes saved successfully.</Alert>
 */
export function Alert({ variant = 'info', className, children }: AlertProps) {
  const { Icon, wrapperClass, iconClass } = VARIANT_CONFIG[variant]

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm',
        wrapperClass,
        className,
      )}
    >
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', iconClass)} aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}
