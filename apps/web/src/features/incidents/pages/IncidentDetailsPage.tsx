import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarClock, CalendarPlus, ListChecks } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Alert, Badge, Button, LoadingState } from '@/components/ui'
import { fadeUpVariants } from '@/lib/motion'
import { useIncident } from '../hooks/useIncidentQueries'
import {
  INCIDENT_TYPE_CONFIG,
  SEVERITY_BADGE,
  STATUS_BADGE,
  STATUS_LABEL,
} from '../incidents.types'

// ── Component ─────────────────────────────────────────────────────────────────

export function IncidentDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: incident, isLoading, isError } = useIncident(id ?? '')

  if (isLoading) {
    return (
      <PageLayout title="Incident Details">
        <LoadingState />
      </PageLayout>
    )
  }

  if (isError || !incident) {
    return (
      <PageLayout title="Incident Details">
        <Alert variant="error">Incident not found or failed to load.</Alert>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => navigate('/incidents')}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to incidents
        </Button>
      </PageLayout>
    )
  }

  const typeConfig  = INCIDENT_TYPE_CONFIG[incident.type]
  const actionSteps = incident.firstActionPlan
    ? incident.firstActionPlan
        .split(/\n|(?<=\.) (?=[A-Z])/)
        .filter((s) => s.trim().length > 10)
    : []
  const isHighSeverity = incident.severity === 'High' || incident.severity === 'Critical'

  return (
    <PageLayout
      title="Incident Details"
      action={
        <Button variant="ghost" onClick={() => navigate('/incidents')}>
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          All incidents
        </Button>
      }
    >
      {/* Summary card */}
      <motion.div
        variants={fadeUpVariants}
        custom={0}
        initial="hidden"
        animate="visible"
        className="mb-5 rounded-2xl border border-gray-100 bg-white shadow-sm px-5 py-5"
      >
        <div className="flex flex-wrap items-start gap-4">
          <span className="text-4xl" aria-hidden="true">{typeConfig.icon}</span>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-900">{typeConfig.label}</h2>
            <p className="mt-1 text-sm text-gray-600">{incident.summary}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-400">
              <CalendarClock className="w-3 h-3" aria-hidden="true" />
              Reported{' '}
              {new Date(incident.createdAt).toLocaleDateString(undefined, {
                weekday: 'short',
                month:   'short',
                day:     'numeric',
                year:    'numeric',
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Badge variant={SEVERITY_BADGE[incident.severity]} dot>
              {incident.severity}
            </Badge>
            <Badge variant={STATUS_BADGE[incident.status]}>
              {STATUS_LABEL[incident.status]}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* High severity nudge */}
      {isHighSeverity && incident.status === 'Open' && (
        <motion.div
          variants={fadeUpVariants}
          custom={1}
          initial="hidden"
          animate="visible"
          className="mb-5"
        >
          <Alert variant="warning">
            This is a <strong>{incident.severity.toLowerCase()}-severity</strong> incident. Book a
            session with a SafeFamily advisor for personalised support.
          </Alert>
        </motion.div>
      )}

      {/* Action plan */}
      {actionSteps.length > 0 && (
        <motion.div
          variants={fadeUpVariants}
          custom={2}
          initial="hidden"
          animate="visible"
          className="mb-5 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-5"
        >
          <h3 className="mb-4 text-sm font-semibold text-indigo-800">Action Plan</h3>
          <ol className="space-y-3">
            {actionSteps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-800">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span>{step.replace(/^\d+\.\s*/, '').replace(/^[🚨⚠️📋✅]\s*/, '')}</span>
              </li>
            ))}
          </ol>
        </motion.div>
      )}

      {/* CTAs */}
      <motion.div
        variants={fadeUpVariants}
        custom={3}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap gap-3"
      >
        <Button variant="primary" onClick={() => navigate('/bookings')}>
          <CalendarPlus className="w-4 h-4" aria-hidden="true" />
          Book help
        </Button>
        <Button variant="outline" onClick={() => navigate('/checklists')}>
          <ListChecks className="w-4 h-4" aria-hidden="true" />
          View checklist
        </Button>
      </motion.div>
    </PageLayout>
  )
}
