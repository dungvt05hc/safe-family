import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BarChart2, CalendarPlus, FileText } from 'lucide-react'
import { Button, EmptyState } from '@/components/ui'
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
  return (
    <div className="flex flex-col items-center gap-3">
      <EmptyState
        icon={FileText}
        title="No reports yet"
        description="Reports are generated after completing a risk assessment or reporting an incident. Start below to create your first report."
        actionLabel="Run Risk Check"
        onAction={() => navigate('/assessment')}
      />
      <Button variant="outline" size="sm" onClick={() => navigate('/bookings')}>
        <CalendarPlus className="w-3.5 h-3.5" aria-hidden="true" />
        Book Family Reset
      </Button>
    </div>
  )
}

function NoResults() {
  return (
    <EmptyState
      icon={BarChart2}
      title="No matching reports"
      description="Try adjusting your search or filters to find what you're looking for."
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
