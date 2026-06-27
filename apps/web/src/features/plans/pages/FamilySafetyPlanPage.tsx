import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CalendarDays,
  Download,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '@/components/layout/PageLayout'
import {
  Alert,
  Button,
  Card,
  CardContent,
  EmptyState,
  LoadingState,
  PremiumLockedState,
} from '@/components/ui'
import { fadeUpVariants } from '@/lib/motion'
import { useEntitlements } from '@/features/entitlements/EntitlementProvider'
import { useSafetyPlans } from '../plans.hooks'
import { useSafetyTasks } from '@/features/tasks/safety-tasks.hooks'
import { useFamilyMembers } from '@/features/families/hooks/useFamilyMembers'
import { useReports, useDownloadReport } from '@/features/reports/reports.hooks'
import { TopRisksSection } from '../components/TopRisksSection'
import { TopPrioritiesSection } from '../components/TopPrioritiesSection'
import { MemberActionPlanSection } from '../components/MemberActionPlanSection'
import { AssetActionPlanSection } from '../components/AssetActionPlanSection'
import { PlanCTABanner } from '../components/PlanCTABanner'
import { PrintFooter } from '@/components/layout/PrintFooter'

// ── Risk level display ────────────────────────────────────────────────────────

const RISK_BADGE: Record<string, string> = {
  Low:      'bg-green-100 text-green-700',
  Medium:   'bg-amber-100 text-amber-700',
  High:     'bg-red-100   text-red-700',
  Critical: 'bg-red-200   text-red-800',
}

// ── Plan header card ──────────────────────────────────────────────────────────

function PlanHeader({
  riskLevel,
  overallScore,
  createdAt,
  reportDownloading,
  onDownload,
  hasReport,
}: {
  riskLevel:         string | null
  overallScore:      number | null
  createdAt:         string
  reportDownloading: boolean
  onDownload:        () => void
  hasReport:         boolean
}) {
  const { t } = useTranslation('plans')
  const date = new Date(createdAt).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" custom={0}>
      <Card>
        <CardContent>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <ShieldCheck className="h-6 w-6 text-blue-500" aria-hidden="true" />
              </span>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{t('familySafetyPlan.title')}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('familySafetyPlan.generatedOn', { date })}
                  </span>
                  {overallScore !== null && (
                    <span className="font-medium text-gray-500">
                      {t('familySafetyPlan.score', { score: overallScore })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {riskLevel && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${RISK_BADGE[riskLevel] ?? 'bg-gray-100 text-gray-500'}`}
                >
                  {riskLevel} Risk
                </span>
              )}

              {hasReport && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDownload}
                  disabled={reportDownloading}
                  className="flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  {reportDownloading ? 'Preparing…' : 'Download Report'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function FamilySafetyPlanPage() {
  const { t } = useTranslation('plans')
  const { hasEntitlement } = useEntitlements()

  const { data: plans,   isLoading: plansLoading,   error: plansError  } = useSafetyPlans()
  const { data: tasks,   isLoading: tasksLoading                        } = useSafetyTasks({ sourceType: 'FamilySafetyPlan' })
  const { data: members, isLoading: membersLoading                      } = useFamilyMembers()
  const { data: reports                                                  } = useReports()
  const downloadMutation = useDownloadReport()

  // Entitlement gate
  if (!hasEntitlement('FamilySafetyPlanAccess')) {
    return <PremiumLockedState product="FamilySafetyPlan" />
  }

  // Loading state
  if (plansLoading || tasksLoading || membersLoading) {
    return (
      <PageLayout title={t('familySafetyPlan.title')}>
        <LoadingState />
      </PageLayout>
    )
  }

  // API error
  if (plansError) {
    const msg = plansError.isPaymentRequired
      ? t('familySafetyPlan.error.paymentRequired')
      : t('familySafetyPlan.error.generic')
    return (
      <PageLayout title={t('familySafetyPlan.title')}>
        <Alert variant="error">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          {msg}
        </Alert>
      </PageLayout>
    )
  }

  // Pick active plan
  const plan = plans?.find(p => p.status === 'Active') ?? plans?.[0]

  if (!plan) {
    return (
      <PageLayout title={t('familySafetyPlan.title')}>
        <EmptyState
          icon={ShieldOff}
          title={t('familySafetyPlan.empty.title')}
          description={t('familySafetyPlan.empty.description')}
        />
      </PageLayout>
    )
  }

  const allTasks     = tasks ?? []
  const allMembers   = members ?? []

  // Derive task groups
  const immediateTasks = allTasks.filter(task => task.phase === 'Immediate')
  const highTasks      = allTasks.filter(task => task.priority === 'High')
  const memberTasks    = allTasks.filter(task => task.targetType === 'FamilyMember')
  const assetTasks     = allTasks.filter(task => task.targetType === 'Device' || task.targetType === 'Account')

  // Task completion counts for CTA banner
  const completedTasks = allTasks.filter(task => task.status === 'Completed').length
  const totalTasks     = allTasks.length

  // SafetyPlan report download
  const safetyReport = reports?.find(r => r.type === 'SafetyPlan')
  function handleDownload() {
    if (safetyReport) downloadMutation.mutate(safetyReport)
  }

  return (
    <PageLayout title={t('familySafetyPlan.title')}>
      <div className="space-y-6">
        {/* Plan header */}
        <PlanHeader
          riskLevel={plan.assessmentRiskLevel}
          overallScore={plan.assessmentOverallScore}
          createdAt={plan.createdAt}
          hasReport={!!safetyReport}
          reportDownloading={downloadMutation.isPending}
          onDownload={handleDownload}
        />

        {/* CTA banner — open full checklist */}
        <PlanCTABanner completedTasks={completedTasks} totalTasks={totalTasks} />

        {/* Top risks */}
        <TopRisksSection
          topRisks={plan.topRisks}
          immediateTasks={immediateTasks}
        />

        {/* Top priorities */}
        <TopPrioritiesSection
          topPriorities={plan.topPriorities}
          highTasks={highTasks}
        />

        {/* Member action plan */}
        <MemberActionPlanSection
          actionPlanByMember={plan.actionPlanByMember}
          memberTasks={memberTasks}
          members={allMembers}
        />

        {/* Asset action plan */}
        <AssetActionPlanSection
          actionPlanByDevice={plan.actionPlanByDevice}
          assetTasks={assetTasks}
        />

        <PrintFooter generatedAt={plan.createdAt} />
      </div>
    </PageLayout>
  )
}
