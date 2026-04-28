import { motion } from 'framer-motion'
import { Crown, CalendarCheck, ShieldCheck, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEntitlements } from '@/features/entitlements/EntitlementProvider'
import { useFeatureFlags } from '@/lib/featureFlags'

// ── Subscriber benefits card ──────────────────────────────────────────────────

function SubscriberCard() {
  const navigate = useNavigate()
  const { t } = useTranslation('dashboard')
  const { plansEnabled } = useFeatureFlags()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
      className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100">
          <Crown className="h-4 w-4 text-indigo-600" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">{t('annualPlan.badge')}</p>
          <p className="text-sm font-bold text-gray-900">{t('annualPlan.activeSubscription')}</p>
        </div>
      </div>

      {/* Benefits */}
      <ul className="space-y-2.5">
        {[
          { icon: ShieldCheck,   key: 'benefit1' as const },
          { icon: Package,       key: 'benefit2' as const },
          { icon: CalendarCheck, key: 'benefit3' as const },
        ].map(({ icon: Icon, key }) => (
          <li key={key} className="flex items-center gap-2.5 text-sm text-indigo-800">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
              <Icon className="h-3 w-3 text-indigo-500" aria-hidden="true" />
            </span>
            {t(`annualPlan.${key}`)}
          </li>
        ))}
      </ul>

      {/* Quick links */}
      <div className="mt-4 flex flex-wrap gap-2">
        {plansEnabled && (
          <>
            <button
              type="button"
              onClick={() => navigate('/plans/safety')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              {t('annualPlan.viewSafetyPlans')}
            </button>
            <span className="text-indigo-300">·</span>
            <button
              type="button"
              onClick={() => navigate('/plans/incident-recovery')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              {t('annualPlan.recoveryPacks')}
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}

// ── Upgrade CTA card ──────────────────────────────────────────────────────────

function UpgradeCard() {
  const navigate = useNavigate()
  const { t } = useTranslation('dashboard')
  const { bookingEnabled } = useFeatureFlags()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
      className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
          <Crown className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-700">{t('annualPlan.upgradeTitle')}</p>
          <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
            {t('annualPlan.upgradeBody')}
          </p>
          {bookingEnabled && (
            <button
              type="button"
              onClick={() => navigate('/bookings')}
              className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              {t('annualPlan.viewPackages')}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Public export ─────────────────────────────────────────────────────────────

/**
 * AnnualPlanCard — a dashboard section that either shows subscriber benefits
 * (when AnnualPlanSubscription entitlement is active) or a soft upgrade CTA.
 * Hidden entirely when both bookings and plans are disabled.
 */
export function AnnualPlanCard() {
  const { hasEntitlement, isLoading } = useEntitlements()
  const { plansEnabled, bookingEnabled } = useFeatureFlags()

  // Don't flash during initial load.
  if (isLoading) return null

  // Subscriber card requires plans to be navigable; upgrade card requires
  // at least one of plans or bookings to show actionable content.
  const showSubscriberCard = hasEntitlement('AnnualPlanSubscription') && plansEnabled
  const showUpgradeCard    = !hasEntitlement('AnnualPlanSubscription') && (plansEnabled || bookingEnabled)

  if (!showSubscriberCard && !showUpgradeCard) return null

  return showSubscriberCard ? <SubscriberCard /> : <UpgradeCard />
}
