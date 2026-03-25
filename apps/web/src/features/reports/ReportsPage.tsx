import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, BarChart2, CalendarCheck, FileText } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Alert, LoadingState } from '@/components/ui'
import { ApiError } from '@/types/api'
import { fadeUpVariants } from '@/lib/motion'
import { DEFAULT_REPORT_FILTERS, type Report, type ReportFilters } from './reports.types'
import { useReports } from './reports.hooks'
import { ReportFilters as ReportFilterBar } from './components/ReportFilters'
import { ReportList } from './components/ReportList'
import { ReportPreviewPanel } from './components/ReportPreviewPanel'

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  index:   number
  label:   string
  value:   string
  icon:    React.ElementType
  iconBg:  string
}

function StatCard({ index, label, value, icon: Icon, iconBg }: StatCardProps) {
  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
    >
      <div className={`flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0 ${iconBg}`}>
        <Icon className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5 leading-none">{value}</p>
      </div>
    </motion.div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ReportsPage() {
  const { data: reports = [], isLoading, isError, error } = useReports()

  const [selected,  setSelected]  = useState<Report | null>(null)
  const [filters,   setFilters]   = useState<ReportFilters>(DEFAULT_REPORT_FILTERS)

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filteredReports = useMemo(() => {
    const search = filters.search.toLowerCase().trim()

    return reports.filter((r) => {
      if (filters.type !== 'All' && r.type !== filters.type) return false

      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom)
        if (new Date(r.generatedAt) < from) return false
      }
      if (filters.dateTo) {
        // include full end day
        const to = new Date(filters.dateTo)
        to.setHours(23, 59, 59, 999)
        if (new Date(r.generatedAt) > to) return false
      }

      if (search) {
        const haystack = `${r.title} ${r.description} ${r.contextLabel ?? ''}`.toLowerCase()
        if (!haystack.includes(search)) return false
      }

      return true
    })
  }, [reports, filters])

  const isFiltered =
    filters.search   !== '' ||
    filters.type     !== 'All' ||
    filters.dateFrom !== '' ||
    filters.dateTo   !== ''

  // ── Summary stats ──────────────────────────────────────────────────────────
  const assessmentCount = reports.filter((r) => r.type === 'Assessment').length
  const incidentCount   = reports.filter((r) => r.type === 'Incident').length
  const latestDate      = reports[0]?.generatedAt
    ? new Date(reports[0].generatedAt).toLocaleDateString('en-AU', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '—'

  // ── Close preview when filters narrow the list and selection disappears ────
  const selectedIsVisible =
    selected !== null && filteredReports.some((r) => r.id === selected.id)

  function handleSelect(report: Report) {
    setSelected((prev) => (prev?.id === report.id ? null : report))
  }

  function handleClose() {
    setSelected(null)
  }

  return (
    <PageLayout
      title="Reports"
      description="View and download safety reports generated from assessments, incidents, and family sessions."
    >
      {/* ── Loading ──────────────────────────────────────────────────────── */}
      {isLoading && <LoadingState />}

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {isError && (
        <Alert variant="error">
          {error instanceof ApiError ? error.message : 'Failed to load reports.'}
        </Alert>
      )}

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {!isLoading && !isError && (
        <div className="flex flex-col gap-6">
          {/* Summary stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              index={0}
              label="Total Reports"
              value={String(reports.length)}
              icon={FileText}
              iconBg="bg-blue-50 text-blue-500"
            />
            <StatCard
              index={1}
              label="Assessments"
              value={String(assessmentCount)}
              icon={BarChart2}
              iconBg="bg-indigo-50 text-indigo-500"
            />
            <StatCard
              index={2}
              label="Incidents"
              value={String(incidentCount)}
              icon={AlertTriangle}
              iconBg="bg-red-50 text-red-500"
            />
            <StatCard
              index={3}
              label="Last Report"
              value={latestDate}
              icon={CalendarCheck}
              iconBg="bg-emerald-50 text-emerald-600"
            />
          </div>

          {/* Filter bar */}
          <ReportFilterBar
            filters={filters}
            onChange={setFilters}
            itemCount={filteredReports.length}
          />

          {/* Master-detail layout */}
          <div className="lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-6">
            {/* Left: report list */}
            <ReportList
              reports={filteredReports}
              selected={selectedIsVisible ? selected : null}
              isFiltered={isFiltered}
              onSelect={handleSelect}
            />

            {/* Right: preview panel
                — hidden on mobile when nothing is selected (shown inline below instead) */}
            <div
              className={`
                lg:block lg:sticky lg:top-6
                ${selectedIsVisible ? 'mt-4 lg:mt-0' : 'hidden lg:block'}
              `}
            >
              <ReportPreviewPanel
                report={selectedIsVisible ? selected : null}
                onClose={handleClose}
              />
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
