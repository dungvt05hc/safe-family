import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BarChart2, CalendarPlus, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, EmptyState } from '@/components/ui'
import { useFeatureFlags } from '@/lib/featureFlags'
import type { Report } from '../reports.types'
import { ReportCard } from './ReportCard'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReportListProps {
  reports:    Report[]
  selected:   Report | null
  isFiltered: boolean
  onSelect:   (report: Report) => void
}

// ── Empty states ──────────────────────────────────────────────────────────────

function NoReports() {
  const navigate = useNavigate()
  const { bookingEnabled } = useFeatureFlags()
  const { t } = useTranslation('reports')
  return (
    <div className="flex flex-col items-center gap-3">
      <EmptyState
        icon={FileText}
        title={t('list.noReportsTitle')}
        description={t('list.noReportsDescription')}
        actionLabel={t('list.runRiskCheck')}
        onAction={() => navigate('/assessment')}
      />
      {bookingEnabled && (
        <Button variant="outline" size="sm" onClick={() => navigate('/bookings')}>
          <CalendarPlus className="w-3.5 h-3.5" aria-hidden="true" />
          {t('list.bookFamilyReset')}
        </Button>
      )}
    </div>
  )
}

function NoResults() {
  const { t } = useTranslation('reports')
  return (
    <EmptyState
      icon={BarChart2}
      title={t('list.noResultsTitle')}
      description={t('list.noResultsDescription')}
    />
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * ReportList — animated list with appropriate empty states.
 */
export function ReportList({ reports, selected, isFiltered, onSelect }: ReportListProps) {
  if (reports.length === 0) {
    return isFiltered ? <NoResults /> : <NoReports />
  }

  return (
    <motion.div className="flex flex-col gap-3" layout>
      <AnimatePresence initial={false}>
        {reports.map((report, i) => (
          <ReportCard
            key={report.id}
            report={report}
            index={i}
            isSelected={selected?.id === report.id}
            onSelect={onSelect}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
