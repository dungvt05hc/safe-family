import { Check, Download, Shield, ShieldCheck, ShieldAlert, Star } from 'lucide-react'
import { type ComponentType } from 'react'
import { motion } from 'framer-motion'
import { fadeUpVariants } from '@/lib/motion'
import { LoadingState } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { ServicePackage } from '../bookings.types'

// ─── Per-package display metadata ─────────────────────────────────────────────
// Keyed by the stable `Code` value from the backend.
// Unknown codes fall back gracefully — cards still render.

interface PackageAccent {
  /** Icon background when selected */
  iconBg: string
  /** Icon fill colour when selected */
  iconColor: string
  /** Card border when selected */
  border: string
  /** Header tint when selected */
  headerBg: string
  /** Check-mark colour when selected */
  checkColor: string
  /** Footer tint when selected */
  footerBg: string
  footerText: string
}

interface PackageMeta {
  icon: ComponentType<{ className?: string }>
  accent: PackageAccent
  badge?: { label: string; className: string }
  tagline: string
  bestFor: string
  highlights: string[]
}

const PACKAGE_META: Record<string, PackageMeta> = {
  'FREE-CHECK': {
    icon:  Shield,
    accent: {
      iconBg:     'bg-green-100',
      iconColor:  'text-green-600',
      border:     'border-green-500',
      headerBg:   'bg-green-50',
      checkColor: 'text-green-500',
      footerBg:   'bg-green-50',
      footerText: 'text-green-600',
    },
    badge:     { label: 'Free — no card needed', className: 'bg-green-100 text-green-700 border border-green-200' },
    tagline:   'Know your exact risk level in minutes',
    bestFor:   'Families new to digital safety who want a clear, no-cost starting point',
    highlights: [
      'Downloadable security summary report',
      '3 personalised action items',
      'Starter safety checklist',
    ],
  },
  'FAMILY-CORE': {
    icon:  ShieldCheck,
    accent: {
      iconBg:     'bg-blue-100',
      iconColor:  'text-blue-600',
      border:     'border-blue-500',
      headerBg:   'bg-blue-50',
      checkColor: 'text-blue-500',
      footerBg:   'bg-blue-50',
      footerText: 'text-blue-600',
    },
    badge:     { label: 'Most popular', className: 'bg-amber-100 text-amber-700 border border-amber-200' },
    tagline:   'A complete safety roadmap for your whole family',
    bestFor:   'Families ready for a thorough safety audit across all accounts and devices',
    highlights: [
      'Personalised family safety plan (PDF)',
      'Premium interactive safety checklist',
      'Password & account audit results',
    ],
  },
  'INCIDENT-RESP': {
    icon:  ShieldAlert,
    accent: {
      iconBg:     'bg-orange-100',
      iconColor:  'text-orange-600',
      border:     'border-orange-500',
      headerBg:   'bg-orange-50',
      checkColor: 'text-orange-500',
      footerBg:   'bg-orange-50',
      footerText: 'text-orange-600',
    },
    badge:     { label: 'For active incidents', className: 'bg-red-100 text-red-700 border border-red-200' },
    tagline:   'Stop an active threat and know exactly what to do next',
    bestFor:   'Families dealing with an active breach, scam, or data leak',
    highlights: [
      'Expert-authored incident recovery pack',
      'Step-by-step threat containment checklist',
      'Follow-up monitoring guide',
    ],
  },
  'ANNUAL-PLAN': {
    icon:  Star,
    accent: {
      iconBg:     'bg-purple-100',
      iconColor:  'text-purple-600',
      border:     'border-purple-500',
      headerBg:   'bg-purple-50',
      checkColor: 'text-purple-500',
      footerBg:   'bg-purple-50',
      footerText: 'text-purple-600',
    },
    badge:     { label: 'Best value', className: 'bg-purple-100 text-purple-700 border border-purple-200' },
    tagline:   'Stay ahead of threats all year with expert-curated guidance',
    bestFor:   'Families wanting ongoing protection and priority access year-round',
    highlights: [
      '4× quarterly safety plan updates',
      'Priority incident response — 24h SLA',
      'Full family security roadmap (PDF)',
      'Unlimited advisor access for 12 months',
    ],
  },
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ServicePackagesSectionProps {
  packages: ServicePackage[] | undefined
  isLoading: boolean
  selectedId: string | null
  onSelect: (id: string) => void
  error?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ServicePackagesSection({
  packages,
  isLoading,
  selectedId,
  onSelect,
  error,
}: ServicePackagesSectionProps) {
  if (isLoading) {
    return <LoadingState className="py-12" />
  }

  if (!packages || packages.length === 0) {
    return <p className="text-sm text-gray-500">No service packages available at this time.</p>
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {packages.map((pkg, i) => {
          const isSelected = selectedId === pkg.id
          const meta = PACKAGE_META[pkg.code]
          const accent = meta?.accent
          const isFree = pkg.priceDisplay === 'Free'

          return (
            <motion.button
              key={pkg.id}
              type="button"
              custom={i}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              onClick={() => onSelect(pkg.id)}
              className={cn(
                'relative flex flex-col overflow-hidden rounded-xl border-2 text-left transition-all',
                isSelected
                  ? `${accent?.border ?? 'border-blue-500'} bg-white shadow-lg`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
              )}
            >
              {/* ── Header: icon + name + badge + checkmark ───────── */}
              <div
                className={cn(
                  'flex items-start justify-between gap-2 px-5 pb-4 pt-5 transition-colors',
                  isSelected ? (accent?.headerBg ?? 'bg-blue-50') : '',
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Package icon */}
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                      isSelected
                        ? (accent?.iconBg ?? 'bg-blue-100')
                        : 'bg-gray-100',
                    )}
                  >
                    {meta
                      ? <meta.icon className={cn('h-5 w-5 transition-colors', isSelected ? (accent?.iconColor ?? 'text-blue-600') : 'text-gray-400')} />
                      : <Shield className="h-5 w-5 text-gray-400" />
                    }
                  </span>

                  {/* Name + badge */}
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-tight text-gray-900">{pkg.name}</p>
                    {meta?.badge && (
                      <span className={cn('mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', meta.badge.className)}>
                        {meta.badge.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Selected radio indicator */}
                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                    isSelected
                      ? `${accent?.border ?? 'border-blue-500'} ${accent?.iconBg ?? 'bg-blue-500'}`
                      : 'border-gray-300 bg-white',
                  )}
                >
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </span>
              </div>

              {/* ── Price + delivery ──────────────────────────────── */}
              <div className="flex items-end justify-between border-t border-gray-100 px-5 py-3">
                <span
                  className={cn(
                    'text-2xl font-extrabold leading-none tracking-tight',
                    isFree ? 'text-green-600' : 'text-gray-900',
                  )}
                >
                  {pkg.priceDisplay}
                </span>
                <span
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                    isSelected
                      ? `${accent?.footerBg ?? 'bg-blue-50'} ${accent?.footerText ?? 'text-blue-600'}`
                      : 'bg-gray-100 text-gray-500',
                  )}
                >
                  <Download className="h-3 w-3 shrink-0" />
                  {pkg.durationLabel}
                </span>
              </div>

              {/* ── Body ──────────────────────────────────────────── */}
              <div className="flex flex-1 flex-col gap-4 px-5 pb-5">
                {/* One-line tagline */}
                {meta?.tagline && (
                  <p className="text-sm font-medium leading-snug text-gray-700">
                    {meta.tagline}
                  </p>
                )}

                {/* Included outcomes */}
                {meta?.highlights && (
                  <ul className="space-y-2 border-t border-gray-100 pt-3">
                    {meta.highlights.map((h, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs leading-snug text-gray-700">
                        <Check
                          className={cn(
                            'mt-0.5 h-3.5 w-3.5 shrink-0',
                            isSelected ? (accent?.checkColor ?? 'text-blue-500') : 'text-gray-400',
                          )}
                        />
                        {h}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Best for */}
                {meta?.bestFor && (
                  <div className="mt-auto rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                    <p className="text-xs">
                      <span className="font-semibold text-gray-500">Best for: </span>
                      <span className="text-gray-600">{meta.bestFor}</span>
                    </p>
                  </div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

