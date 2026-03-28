import { motion } from 'framer-motion'
import { UserPlus, PlusCircle, ClipboardList, Flame, CalendarPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { DashboardCounts } from '../dashboard.types'

type ActionVariant = 'default' | 'primary' | 'danger'

const VARIANT_STYLES: Record<ActionVariant, string> = {
  default: 'border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700',
  primary: 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
  danger:  'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
}

interface ActionItem {
  label:   string
  icon:    React.ElementType
  variant: ActionVariant
  path:    string
  /** Show a numeric badge on the button when > 0 */
  badge?:  number
}

interface QuickActionsProps {
  counts: DashboardCounts
}

/**
 * QuickActions — a grid of contextual shortcut buttons for the most common tasks.
 * Surfaces attention-grabbing badges when key data is missing.
 */
export function QuickActions({ counts }: QuickActionsProps) {
  const navigate = useNavigate()

  const actions: ActionItem[] = [
    {
      label:   'Add Member',
      icon:    UserPlus,
      variant: counts.members === 0 ? 'primary' : 'default',
      path:    '/family/members',
    },
    {
      label:   'Add Account',
      icon:    PlusCircle,
      variant: counts.accounts === 0 ? 'primary' : 'default',
      path:    '/accounts',
    },
    {
      label:   'Risk Check',
      icon:    ClipboardList,
      variant: 'primary',
      path:    '/assessment',
    },
    {
      label:   'Report Incident',
      icon:    Flame,
      variant: 'danger',
      path:    '/incidents/report',
    },
    {
      label:   'Book Support',
      icon:    CalendarPlus,
      variant: 'default',
      path:    '/bookings',
    },
  ]

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 lg:col-span-3">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {actions.map((action, i) => (
          <motion.button
            key={action.label}
            type="button"
            custom={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3, ease: 'easeOut' }}
            onClick={() => navigate(action.path)}
            className={cn(
              'relative flex flex-col items-center gap-2 rounded-2xl p-4 text-xs font-semibold transition-all cursor-pointer',
              VARIANT_STYLES[action.variant],
            )}
          >
            <action.icon className="w-5 h-5" aria-hidden="true" />
            <span className="text-center leading-tight">{action.label}</span>
            {action.badge !== undefined && action.badge > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {action.badge}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
