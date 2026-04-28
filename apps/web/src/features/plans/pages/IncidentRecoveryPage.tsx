import { motion } from 'framer-motion'
import { Package, CalendarDays, Link as LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '@/components/layout/PageLayout'
import { Alert, Card, CardContent, EmptyState, LoadingState, LockedFeature } from '@/components/ui'
import { fadeUpVariants } from '@/lib/motion'
import { ApiError } from '@/types/api'
import { useEntitlements } from '@/features/entitlements/EntitlementProvider'
import { useIncidentRecoveryPacks } from '../plans.hooks'
import type { IncidentRecoveryPack } from '../plans.types'

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  Active:     'bg-red-100   text-red-700',
  Superseded: 'bg-gray-100  text-gray-500',
  Archived:   'bg-amber-100 text-amber-700',
}

// ── Single pack card ──────────────────────────────────────────────────────────

function RecoveryPackCard({ pack, index }: { pack: IncidentRecoveryPack; index: number }) {
  const { t } = useTranslation('plans')
  const date = new Date(pack.createdAt).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <motion.div
      custom={index}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardContent className="space-y-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                <Package className="h-5 w-5 text-red-500" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{t('incidentRecovery.cardTitle')}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                  <CalendarDays className="h-3 w-3" aria-hidden="true" />
                  {date}
                </div>
              </div>
            </div>

            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[pack.status] ?? 'bg-gray-100 text-gray-500'}`}
            >
              {pack.status}
            </span>
          </div>

          <hr className="border-gray-100" />

          {/* Content grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <PackSection title={t('incidentRecovery.sections.whatHappened')}   content={pack.whatHappened} />
            <PackSection title={t('incidentRecovery.sections.whatToDoNow')}    content={pack.whatToDoNow} />
            <PackSection title={t('incidentRecovery.sections.whatNotToDo')}    content={pack.whatNotToDo} />
            <PackSection title={t('incidentRecovery.sections.next24Hours')}    content={pack.next24Hours} />
          </div>

          <PackSection title={t('incidentRecovery.sections.next7Days')} content={pack.next7Days} />

          {/* Footer: linked entities */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 pt-1">
            <LinkIcon className="h-3 w-3" aria-hidden="true" />
            <Link to={`/bookings/${pack.bookingId}`} className="hover:text-blue-600 hover:underline">
              {t('incidentRecovery.viewBooking')}
            </Link>
            {pack.linkedIncidentId && (
              <>
                <span>·</span>
                <Link to={`/incidents/${pack.linkedIncidentId}`} className="hover:text-blue-600 hover:underline">
                  {t('incidentRecovery.viewIncident')}
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function PackSection({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function IncidentRecoveryPage() {
  const { t } = useTranslation('plans')
  const { hasEntitlement, isLoading: entLoading } = useEntitlements()
  const { data: packs = [], isLoading, isError, error } = useIncidentRecoveryPacks()

  if (!entLoading && !hasEntitlement('IncidentRecoveryPackAccess')) {
    return (
      <PageLayout
        title={t('incidentRecovery.title')}
        description={t('incidentRecovery.description')}
      >
        <LockedFeature
          title={t('incidentRecovery.lockedTitle')}
          description={t('incidentRecovery.lockedDescription')}
          packageName={t('incidentRecovery.lockedPackage')}
          ctaLabel={t('incidentRecovery.lockedCta')}
          ctaPath="/bookings"
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={t('incidentRecovery.title')}
      description={t('incidentRecovery.description')}
    >
      {(isLoading || entLoading) && <LoadingState />}

      {isError && (
        <Alert variant="error">
          {error instanceof ApiError && error.isPaymentRequired
            ? t('incidentRecovery.error.subscription')
            : error instanceof ApiError
            ? error.message
            : t('incidentRecovery.error.generic')}
        </Alert>
      )}

      {!isLoading && !isError && packs.length === 0 && (
        <EmptyState
          icon={Package}
          title={t('incidentRecovery.empty.title')}
          description={t('incidentRecovery.empty.description')}
        />
      )}

      {!isLoading && !isError && packs.length > 0 && (
        <div className="flex flex-col gap-5">
          {packs.map((pack, i) => (
            <RecoveryPackCard key={pack.id} pack={pack} index={i} />
          ))}
        </div>
      )}
    </PageLayout>
  )
}
