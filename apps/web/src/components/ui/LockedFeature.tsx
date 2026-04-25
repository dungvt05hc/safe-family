import { Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { useFeatureFlags } from '@/lib/featureFlags'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LockedFeatureProps {
  /** Short heading — what the feature is called. */
  title: string
  /** One-line explanation of what the user is missing. */
  description: string
  /** Which package unlocks this feature. Rendered as "Included with …". */
  packageName?: string
  /** CTA button label. Defaults to "View packages". */
  ctaLabel?: string
  /** CTA button destination. Defaults to /bookings. */
  ctaPath?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * LockedFeature — full-page paywall placeholder rendered when the user attempts
 * to access a feature they have not purchased.
 *
 * Pair with the `useEntitlements` hook:
 *
 *   if (!hasEntitlement('FamilySafetyPlanAccess'))
 *     return <LockedFeature title="..." description="..." packageName="..." />
 */
export function LockedFeature({
  title,
  description,
  packageName,
  ctaLabel = 'View packages',
  ctaPath  = '/bookings',
}: LockedFeatureProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('common')
  const { bookingEnabled } = useFeatureFlags()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-8 py-20 text-center"
    >
      {/* Lock icon */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
        <Lock className="h-7 w-7 text-gray-400" aria-hidden="true" />
      </div>

      {/* Heading */}
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>

      {/* Description */}
      <p className="mt-2 max-w-sm text-sm text-gray-500 leading-relaxed">{description}</p>

      {/* Package label */}
      {packageName && (
        <p className="mt-1.5 text-sm font-medium text-blue-600">
          {t('includedWith', { name: packageName })}
        </p>
      )}

      {/* CTA */}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        {bookingEnabled && (
          <Button variant="primary" onClick={() => navigate(ctaPath)}>
            {ctaLabel}
          </Button>
        )}
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          {t('backToDashboardLabel')}
        </Button>
      </div>
    </motion.div>
  )
}
