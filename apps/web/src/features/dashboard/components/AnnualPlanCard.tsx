import { motion } from 'framer-motion'
import { Crown, CalendarCheck, ShieldCheck, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEntitlements } from '@/features/entitlements/EntitlementProvider'

// ── Subscriber benefits card ──────────────────────────────────────────────────

function SubscriberCard() {
  const navigate = useNavigate()

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
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Annual Plan</p>
          <p className="text-sm font-bold text-gray-900">Active subscription</p>
        </div>
      </div>

      {/* Benefits */}
      <ul className="space-y-2.5">
        {[
          { icon: ShieldCheck, label: 'Family Safety Plans — unlimited access' },
          { icon: Package,     label: 'Priority Incident Response (24-hour SLA)' },
          { icon: CalendarCheck, label: '4× quarterly safety plan updates per year' },
        ].map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2.5 text-sm text-indigo-800">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
              <Icon className="h-3 w-3 text-indigo-500" aria-hidden="true" />
            </span>
            {label}
          </li>
        ))}
      </ul>

      {/* Quick links */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => navigate('/plans/safety')}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          View Safety Plans →
        </button>
        <span className="text-indigo-300">·</span>
        <button
          type="button"
          onClick={() => navigate('/plans/incident-recovery')}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          Recovery Packs →
        </button>
      </div>
    </motion.div>
  )
}

// ── Upgrade CTA card ──────────────────────────────────────────────────────────

function UpgradeCard() {
  const navigate = useNavigate()

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
          <p className="text-sm font-semibold text-gray-700">Unlock Annual Plan benefits</p>
          <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
            Get unlimited Safety Plans, priority incident response, and quarterly updates for your entire family.
          </p>
          <button
            type="button"
            onClick={() => navigate('/bookings')}
            className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            View packages →
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Public export ─────────────────────────────────────────────────────────────

/**
 * AnnualPlanCard — a dashboard section that either shows subscriber benefits
 * (when AnnualPlanSubscription entitlement is active) or a soft upgrade CTA.
 */
export function AnnualPlanCard() {
  const { hasEntitlement, isLoading } = useEntitlements()

  // Don't flash during initial load.
  if (isLoading) return null

  return hasEntitlement('AnnualPlanSubscription')
    ? <SubscriberCard />
    : <UpgradeCard />
}
