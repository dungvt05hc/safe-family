import { motion } from 'framer-motion'
import { ShieldCheck, CalendarDays, AlertTriangle, Link as LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '@/components/layout/PageLayout'
import { Alert, Card, CardContent, EmptyState, LoadingState, LockedFeature } from '@/components/ui'
import { fadeUpVariants } from '@/lib/motion'
import { ApiError } from '@/types/api'
import { useEntitlements } from '@/features/entitlements/EntitlementProvider'
import { useSafetyPlans } from '../plans.hooks'
import type { FamilySafetyPlan } from '../plans.types'

// ── Plan status helpers ───────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  Active:     'bg-green-100  text-green-700',
  Superseded: 'bg-gray-100   text-gray-500',
  Archived:   'bg-amber-100  text-amber-700',
}

// ── Single plan card ──────────────────────────────────────────────────────────

function SafetyPlanCard({ plan, index }: { plan: FamilySafetyPlan; index: number }) {
  const { t } = useTranslation('plans')
  const date = new Date(plan.createdAt).toLocaleDateString('en-AU', {
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
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <ShieldCheck className="h-5 w-5 text-blue-500" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{t('safetyPlans.card.title')}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                  <CalendarDays className="h-3 w-3" aria-hidden="true" />
                  {date}
                </div>
              </div>
            </div>

            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[plan.status] ?? 'bg-gray-100 text-gray-500'}`}
            >
              {plan.status}
            </span>
          </div>

          {/* Risk level badge */}
          {plan.assessmentRiskLevel && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
              <span className="text-xs text-gray-600">
                {t('safetyPlans.card.riskLevel')}:{' '}
                <span className="font-medium text-amber-700">{plan.assessmentRiskLevel}</span>
                {plan.assessmentOverallScore !== null && (
                  <span className="ml-1 text-gray-400">({plan.assessmentOverallScore}/100)</span>
                )}
              </span>
            </div>
          )}

          <hr className="border-gray-100" />

          {/* Section grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <PlanSection title={t('safetyPlans.card.topRisks')}         content={plan.topRisks} />
            <PlanSection title={t('safetyPlans.card.topPriorities')}    content={plan.topPriorities} />
            <PlanSection title={t('safetyPlans.card.actionPlanMembers')} content={plan.actionPlanByMember} />
            <PlanSection title={t('safetyPlans.card.actionPlanDevices')} content={plan.actionPlanByDevice} />
          </div>

          {/* Footer: linked booking */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-1">
            <LinkIcon className="h-3 w-3" aria-hidden="true" />
            <Link to={`/bookings/${plan.bookingId}`} className="hover:text-blue-600 hover:underline">
              {t('safetyPlans.card.viewBooking')}
            </Link>
            {plan.sourceAssessmentId && (
              <>
                <span>·</span>
                <Link to="/assessment/history" className="hover:text-blue-600 hover:underline">
                  {t('safetyPlans.card.sourceAssessment')}
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function PlanSection({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  )
}

// ── SafetyPlanCard internal labels ────────────────────────────────────────────
// These sub-labels (Risk level:, Top Risks, etc.) are rendered inside the card
// but need t() from a parent that calls useTranslation. We pass them as strings.

// ── Page ──────────────────────────────────────────────────────────────────────

export function SafetyPlansPage() {
  const { hasEntitlement, isLoading: entLoading } = useEntitlements()
  const { data: plans = [], isLoading, isError, error } = useSafetyPlans()
  const { t } = useTranslation('plans')

  // Show locked state immediately (without fetching) when we know there's no entitlement.
  if (!entLoading && !hasEntitlement('FamilySafetyPlanAccess')) {
    return (
      <PageLayout
        title={t('safetyPlans.title')}
        description={t('safetyPlans.description')}
      >
        <LockedFeature
          title={t('safetyPlans.lockedTitle')}
          description={t('safetyPlans.lockedDescription')}
          packageName={t('safetyPlans.lockedPackage')}
          ctaLabel={t('safetyPlans.lockedCta')}
          ctaPath="/bookings"
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={t('safetyPlans.title')}
      description={t('safetyPlans.description')}
    >
      {(isLoading || entLoading) && <LoadingState />}

      {isError && (
        <Alert variant="error">
          {error instanceof ApiError && error.isPaymentRequired
            ? t('safetyPlans.error.subscription')
            : error instanceof ApiError
            ? error.message
            : t('safetyPlans.error.generic')}
        </Alert>
      )}

      {!isLoading && !isError && plans.length === 0 && (
        <EmptyState
          icon={ShieldCheck}
          title={t('safetyPlans.empty.title')}
          description={t('safetyPlans.empty.description')}
        />
      )}

      {!isLoading && !isError && plans.length > 0 && (
        <div className="flex flex-col gap-5">
          {plans.map((plan, i) => (
            <SafetyPlanCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>
      )}
    </PageLayout>
  )
}
