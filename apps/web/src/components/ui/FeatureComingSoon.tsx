import { motion } from 'framer-motion'
import { CalendarClock, LayoutDashboard, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import type { FeatureFlags } from '@/lib/featureFlags'

// ── Per-flag styling ──────────────────────────────────────────────────────────

interface FeatureMeta {
  icon:        LucideIcon
  iconBg:      string
  iconColor:   string
  badgeColor:  string
}

const FLAG_META: Record<keyof FeatureFlags, FeatureMeta> = {
  bookingEnabled: {
    icon:        CalendarClock,
    iconBg:      'bg-violet-100',
    iconColor:   'text-violet-500',
    badgeColor:  'bg-violet-100 text-violet-600',
  },
  paymentsEnabled: {
    icon:        CalendarClock,
    iconBg:      'bg-amber-100',
    iconColor:   'text-amber-500',
    badgeColor:  'bg-amber-100 text-amber-600',
  },
  plansEnabled: {
    icon:        CalendarClock,
    iconBg:      'bg-indigo-100',
    iconColor:   'text-indigo-500',
    badgeColor:  'bg-indigo-100 text-indigo-600',
  },
}

/** Maps feature flag key to the i18n sub-key in common.featureFlags */
const FLAG_I18N_KEY: Record<keyof FeatureFlags, 'booking' | 'payments' | 'plans'> = {
  bookingEnabled:  'booking',
  paymentsEnabled: 'payments',
  plansEnabled:    'plans',
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface FeatureComingSoonProps {
  /** The feature flag key — used to look up icon and copy. */
  feature: keyof FeatureFlags
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * FeatureComingSoon — full-area placeholder rendered when a feature flag is
 * disabled.  Sits inside the AppLayout so the sidebar remains accessible.
 *
 * Used automatically by FeatureFlagRoute when a flag is off.
 */
export function FeatureComingSoon({ feature }: FeatureComingSoonProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('common')
  const meta     = FLAG_META[feature]
  const Icon     = meta.icon
  const flagKey  = FLAG_I18N_KEY[feature]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-20 text-center"
    >
      {/* Icon bubble */}
      <div
        className={`mb-6 flex h-20 w-20 items-center justify-center rounded-3xl ${meta.iconBg}`}
        aria-hidden="true"
      >
        <Icon className={`h-9 w-9 ${meta.iconColor}`} strokeWidth={1.5} />
      </div>

      {/* "Coming Soon" badge */}
      <span
        className={`mb-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${meta.badgeColor}`}
      >
        {t('comingSoon')}
      </span>

      {/* Headline */}
      <h1 className="text-2xl font-bold text-gray-900">
        {t(`featureFlags.${flagKey}.title` as Parameters<typeof t>[0])}
      </h1>

      {/* Body copy */}
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
        {t(`featureFlags.${flagKey}.description` as Parameters<typeof t>[0])}
      </p>

      {/* Reassurance note */}
      <p className="mt-2 text-xs text-gray-400">
        This feature will be enabled automatically — no action needed on your end.
      </p>

      {/* CTA */}
      <Button
        variant="primary"
        size="md"
        className="mt-8"
        onClick={() => navigate('/dashboard')}
      >
        <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
        {t('backToDashboard')}
      </Button>
    </motion.div>
  )
}
