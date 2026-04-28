import { motion } from 'framer-motion'
import {
  CalendarDays,
  Check,
  Lock,
  type LucideIcon,
  Package,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { useFeatureFlags } from '@/lib/featureFlags'

// ── Product registry ──────────────────────────────────────────────────────────

/**
 * The four gated premium products in SafeFamily.
 * Each product maps to a preset visual config + feature list.
 */
export type PremiumProduct =
  | 'PremiumChecklist'
  | 'FamilySafetyPlan'
  | 'IncidentRecoveryPack'
  | 'AnnualPlan'

interface ProductConfig {
  icon:           LucideIcon
  /** Tailwind classes for the icon wrapper bg */
  iconBg:         string
  /** Tailwind text colour for the icon */
  iconColor:      string
  /** Tailwind classes for the feature-check icon */
  checkColor:     string
  /** Tailwind border + bg on the outer container */
  containerStyle: string
  /** Navigation path for the upgrade CTA */
  ctaPath:        string
}

export const PRODUCT_CONFIGS: Record<PremiumProduct, ProductConfig> = {
  PremiumChecklist: {
    icon:           ShieldCheck,
    iconBg:         'bg-blue-100',
    iconColor:      'text-blue-600',
    checkColor:     'text-blue-500',
    containerStyle: 'border-blue-100 bg-blue-50/40',
    ctaPath:        '/bookings',
  },
  FamilySafetyPlan: {
    icon:           ShieldCheck,
    iconBg:         'bg-indigo-100',
    iconColor:      'text-indigo-600',
    checkColor:     'text-indigo-500',
    containerStyle: 'border-indigo-100 bg-indigo-50/40',
    ctaPath:        '/bookings',
  },
  IncidentRecoveryPack: {
    icon:           Package,
    iconBg:         'bg-red-100',
    iconColor:      'text-red-600',
    checkColor:     'text-red-500',
    containerStyle: 'border-red-100 bg-red-50/40',
    ctaPath:        '/bookings',
  },
  AnnualPlan: {
    icon:           CalendarDays,
    iconBg:         'bg-emerald-100',
    iconColor:      'text-emerald-600',
    checkColor:     'text-emerald-500',
    containerStyle: 'border-emerald-100 bg-emerald-50/40',
    ctaPath:        '/bookings',
  },
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface PremiumLockedStateProps {
  /** Which product is locked — selects the preset config. */
  product: PremiumProduct
  /**
   * Optional override: show a muted note instead of the full gate
   * (e.g. "Your pack is being prepared"), skipping the feature list.
   */
  note?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * PremiumLockedState — a full-area paywall placeholder with:
 *  - product icon + colour theming
 *  - pitch + feature checklist
 *  - upgrade CTA buttons
 *
 * Usage:
 *   if (!hasEntitlement('FamilySafetyPlanAccess'))
 *     return <PremiumLockedState product="FamilySafetyPlan" />
 */
export function PremiumLockedState({ product }: PremiumLockedStateProps) {
  const navigate = useNavigate()
  const { t }  = useTranslation('plans')
  const { t: tc } = useTranslation('common')
  const { bookingEnabled } = useFeatureFlags()
  const cfg = PRODUCT_CONFIGS[product]
  const Icon = cfg.icon

  const title       = t(`products.${product}.title`)
  const pitch       = t(`products.${product}.pitch`)
  const features    = t(`products.${product}.features`, { returnObjects: true }) as string[]
  const packageName = t(`products.${product}.packageName`)
  const ctaLabel    = t(`products.${product}.ctaLabel`)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`rounded-2xl border px-8 py-14 text-center ${cfg.containerStyle}`}
      role="region"
      aria-label={`${title} — locked`}
    >
      {/* Icon */}
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl relative">
        <span className={`absolute inset-0 rounded-2xl ${cfg.iconBg}`} aria-hidden="true" />
        <Icon className={`relative z-10 h-8 w-8 ${cfg.iconColor}`} aria-hidden="true" />
        {/* Lock badge */}
        <span
          className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-800 shadow-sm"
          aria-hidden="true"
        >
          <Lock className="h-3 w-3 text-white" />
        </span>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>

      {/* Pitch */}
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 leading-relaxed">
        {pitch}
      </p>

      {/* Feature list */}
      <div className="mx-auto mt-7 max-w-sm rounded-xl border border-white/80 bg-white/70 px-5 py-4 text-left shadow-sm">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          {t('products.whatsIncluded')}
        </p>
        <ul className="space-y-2.5" role="list">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Check
                className={`mt-0.5 h-4 w-4 shrink-0 ${cfg.checkColor}`}
                aria-hidden="true"
              />
              <span className="text-sm text-gray-700 leading-snug">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Package label */}
      <p className="mt-5 text-xs text-gray-400">
        {t('products.includedWith', { name: packageName })}
      </p>

      {/* CTAs */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {bookingEnabled && (
          <Button variant="primary" onClick={() => navigate(cfg.ctaPath)}>
            {ctaLabel}
          </Button>
        )}
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          {tc('backToDashboardLabel')}
        </Button>
      </div>
    </motion.div>
  )
}
