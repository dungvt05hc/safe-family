import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, X, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import type { PremiumProduct } from './PremiumLockedState'
import { PRODUCT_CONFIGS } from './PremiumLockedState'

// ── Props ─────────────────────────────────────────────────────────────────────

export interface UpgradeCTACardProps {
  /** Which product config to use for theming + copy. */
  product:       PremiumProduct
  /**
   * Override the default pitch line from the product config.
   * Useful to customise messaging for inline placement context.
   */
  pitchOverride?: string
  /** Whether to show a dismiss (×) button. Default false. */
  dismissible?:   boolean
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * UpgradeCTACard — a compact inline upgrade nudge.
 *
 * Use this inside pages the user HAS partial access to, to surface
 * an adjacent feature they haven't unlocked yet.
 *
 * Example: shown inside PremiumChecklistPage when the user lacks
 * AnnualPlanSubscription, nudging them to unlock annual recurring tasks.
 *
 *   <UpgradeCTACard product="AnnualPlan" dismissible />
 */
export function UpgradeCTACard({
  product,
  pitchOverride,
  dismissible = false,
}: UpgradeCTACardProps) {
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  const cfg  = PRODUCT_CONFIGS[product]
  const Icon: LucideIcon = cfg.icon
  const pitch = pitchOverride ?? cfg.pitch

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          key="upgrade-cta"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6, height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`relative flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:gap-5 ${cfg.containerStyle}`}
          role="region"
          aria-label={`Upgrade to ${cfg.title}`}
        >
          {/* Icon */}
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.iconBg}`}
          >
            <Icon className={`h-5 w-5 ${cfg.iconColor}`} aria-hidden="true" />
          </span>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${cfg.iconColor}`}>{cfg.title}</p>
            <p className="mt-0.5 text-xs text-gray-500 leading-relaxed line-clamp-2">{pitch}</p>
          </div>

          {/* CTA */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(cfg.ctaPath)}
            className="shrink-0 flex items-center gap-1.5"
          >
            {cfg.ctaLabel}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>

          {/* Dismiss */}
          {dismissible && (
            <button
              onClick={() => setDismissed(true)}
              aria-label={`Dismiss upgrade prompt for ${cfg.title}`}
              className="absolute right-3 top-3 rounded p-0.5 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
