import { motion } from 'framer-motion'
import { UserPlus, PlusCircle, ClipboardList, Flame, CalendarPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useFeatureFlags } from '@/lib/featureFlags'
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
  const { bookingEnabled } = useFeatureFlags()
  const { t } = useTranslation('dashboard')

  const actions: ActionItem[] = [
    {
      label:   t('addMember'),
      icon:    UserPlus,
      variant: counts.members === 0 ? 'primary' : 'default',
      path:    '/family/members',
    },
    {
      label:   t('addAccount'),
      icon:    PlusCircle,
      variant: counts.accounts === 0 ? 'primary' : 'default',
      path:    '/accounts',
    },
    {
      label:   t('runRiskCheck'),
      icon:    ClipboardList,
      variant: 'primary',
      path:    '/assessment',
    },
    {
      label:   t('reportIncident'),
      icon:    Flame,
      variant: 'danger',
      path:    '/incidents/report',
    },
    ...(bookingEnabled ? [{
      label:   t('bookSupport'),
      icon:    CalendarPlus,
      variant: 'default' as ActionVariant,
      path:    '/bookings',
    }] : []),
  ]

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 lg:col-span-3">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('quickActions')}</h2>
      <div
        className="grid gap-2 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${actions.length}, minmax(0, 1fr))` }}
      >
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
