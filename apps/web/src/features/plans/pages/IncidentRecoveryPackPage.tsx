import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CalendarDays,
  Download,
  Package,
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
import { useIncidentRecoveryPacks } from '../plans.hooks'
import { useSafetyTasks } from '@/features/tasks/safety-tasks.hooks'
import { useReports, useDownloadReport } from '@/features/reports/reports.hooks'
import { WhatHappenedSection } from '../components/WhatHappenedSection'
import { ImmediateActionsSection } from '../components/ImmediateActionsSection'
import { WhatNotToDoSection } from '../components/WhatNotToDoSection'
import { Next24HoursSection } from '../components/Next24HoursSection'
import { Next7DaysSection } from '../components/Next7DaysSection'
import type { IncidentRecoveryPack } from '../plans.types'
import { PrintFooter } from '@/components/layout/PrintFooter'

// ── Pack header ───────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  Active:     'bg-red-100   text-red-700',
  Superseded: 'bg-gray-100  text-gray-500',
  Archived:   'bg-amber-100 text-amber-700',
}

function PackHeader({
  pack,
  reportDownloading,
  hasReport,
  onDownload,
}: {
  pack:              IncidentRecoveryPack
  reportDownloading: boolean
  hasReport:         boolean
  onDownload:        () => void
}) {
  const { t } = useTranslation('plans')
  const date = new Date(pack.createdAt).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" custom={-1}>
      <Card>
        <CardContent>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
                <Package className="h-6 w-6 text-red-500" aria-hidden="true" />
              </span>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{t('recoveryPack.title')}</h1>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('recoveryPack.generatedOn', { date })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[pack.status] ?? 'bg-gray-100 text-gray-500'}`}
              >
                {pack.status}
              </span>

              {hasReport && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDownload}
                  disabled={reportDownloading}
                  className="flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  {reportDownloading ? t('recoveryPack.preparing') : t('recoveryPack.downloadReport')}
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

export function IncidentRecoveryPackPage() {
  const { hasEntitlement, isLoading: entLoading } = useEntitlements()
  const { t } = useTranslation('plans')

  const { data: packs,   isLoading: packsLoading,   isError, error   } = useIncidentRecoveryPacks()
  const { data: tasks,   isLoading: tasksLoading                      } = useSafetyTasks({ sourceType: 'IncidentRecoveryPack' })
  const { data: reports                                                } = useReports()
  const downloadMutation = useDownloadReport()

  // Entitlement gate
  if (!entLoading && !hasEntitlement('IncidentRecoveryPackAccess')) {
    return <PremiumLockedState product="IncidentRecoveryPack" />
  }

  if (packsLoading || tasksLoading || entLoading) {
    return (
      <PageLayout title={t('recoveryPack.title')}>
        <LoadingState />
      </PageLayout>
    )
  }

  if (isError) {
    const msg = error?.isPaymentRequired
      ? t('recoveryPack.error.subscription')
      : error?.message ?? t('recoveryPack.error.generic')
    return (
      <PageLayout title={t('recoveryPack.title')}>
        <Alert variant="error">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          {msg}
        </Alert>
      </PageLayout>
    )
  }

  const pack = packs?.find(p => p.status === 'Active') ?? packs?.[0]

  if (!pack) {
    return (
      <PageLayout title={t('recoveryPack.title')}>
        <EmptyState
          icon={ShieldOff}
          title={t('recoveryPack.empty.title')}
          description={t('recoveryPack.empty.description')}
        />
      </PageLayout>
    )
  }

  const allTasks = tasks ?? []

  // Distribute tasks by phase — non-overlapping buckets
  const immediateTasks = allTasks.filter(t => t.phase === 'Immediate')
  const weekTasks      = allTasks.filter(t => t.phase === 'Next7Days')
  // High-priority week tasks surface in the "Next 24 Hours" section
  const next24hTasks   = weekTasks.filter(t => t.priority === 'High')
  // All week tasks visible in the full 7-day section
  const next7dTasks    = weekTasks

  // Downloadable incident recovery report
  const recoveryReport = reports?.find(
    r => r.type === 'IncidentRecovery' && (r.incidentId === pack.linkedIncidentId || !r.incidentId),
  )
  function handleDownload() {
    if (recoveryReport) downloadMutation.mutate(recoveryReport)
  }

  return (
    <PageLayout
      title={t('recoveryPack.title')}
      description={t('recoveryPack.description')}
    >
      <div className="space-y-5">
        {/* Pack header */}
        <PackHeader
          pack={pack}
          hasReport={!!recoveryReport}
          reportDownloading={downloadMutation.isPending}
          onDownload={handleDownload}
        />

        {/* What happened — neutral context */}
        <WhatHappenedSection pack={pack} />

        {/* What to do right now (Immediate phase tasks) */}
        <ImmediateActionsSection
          whatToDoNow={pack.whatToDoNow}
          tasks={immediateTasks}
        />

        {/* What NOT to do — clear warning */}
        <WhatNotToDoSection whatNotToDo={pack.whatNotToDo} />

        {/* Next 24 hours — high-priority week tasks */}
        <Next24HoursSection
          next24Hours={pack.next24Hours}
          tasks={next24hTasks}
        />

        {/* Full 7-day recovery plan */}
        <Next7DaysSection
          next7Days={pack.next7Days}
          tasks={next7dTasks}
        />

        <PrintFooter generatedAt={pack.createdAt} confidential />
      </div>
    </PageLayout>
  )
}
