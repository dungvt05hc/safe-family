import { Check, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeUpVariants } from '@/lib/motion'
import { LoadingState } from '@/components/ui'
import type { ServicePackage } from '../bookings.types'

interface ServicePackagesSectionProps {
  packages: ServicePackage[] | undefined
  isLoading: boolean
  selectedId: string | null
  onSelect: (id: string) => void
  error?: string
}

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
    return (
      <p className="text-sm text-gray-500">
        No service packages available at this time.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {packages.map((pkg, i) => {
          const isSelected = selectedId === pkg.id
          return (
            <motion.button
              key={pkg.id}
              type="button"
              custom={i}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              onClick={() => onSelect(pkg.id)}
              className={[
                'relative flex flex-col gap-3 rounded-xl border-2 p-5 text-left transition-all',
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
              ].join(' ')}
            >
              {/* Selected check */}
              {isSelected && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                  <Check className="h-3 w-3" />
                </span>
              )}

              {/* Name + price */}
              <div className="flex items-start justify-between gap-2 pr-6">
                <span className="font-semibold text-gray-900">{pkg.name}</span>
                <span
                  className={[
                    'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    pkg.priceDisplay === 'Free'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700',
                  ].join(' ')}
                >
                  {pkg.priceDisplay}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm leading-relaxed text-gray-500">{pkg.description}</p>

              {/* Duration */}
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="h-3.5 w-3.5" />
                {pkg.durationLabel}
              </div>
            </motion.button>
          )
        })}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
