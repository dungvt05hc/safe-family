import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, CalendarPlus, ListChecks, ShieldAlert } from 'lucide-react'
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

export function IncidentResultPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: incident, isLoading, isError } = useIncident(id ?? '')

  if (isLoading) {
    return (
      <PageLayout title="Incident Report">
        <LoadingState />
      </PageLayout>
    )
  }

  if (isError || !incident) {
    return (
      <PageLayout title="Incident Report">
        <Alert variant="error">Failed to load incident. Please try again.</Alert>
      </PageLayout>
    )
  }

  const typeConfig     = INCIDENT_TYPE_CONFIG[incident.type]
  const actionSteps    = incident.firstActionPlan
    ? incident.firstActionPlan.split(/\n|(?<=\.) (?=[A-Z])/).filter((s) => s.trim().length > 10)
    : []
  const isHighSeverity = incident.severity === 'High' || incident.severity === 'Critical'

  return (
    <PageLayout
      title="Incident Action Plan"
      description="Follow the steps below to contain and remediate this incident."
    >
      {/* Success banner */}
      <motion.div
        variants={fadeUpVariants}
        custom={0}
        initial="hidden"
        animate="visible"
        className="mb-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4"
      >
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-green-800">Incident recorded</p>
          <p className="text-xs text-green-700">
            Your incident has been logged. Follow the action plan below to stay protected.
          </p>
        </div>
      </motion.div>

      {/* Incident summary card */}
      <motion.div
        variants={fadeUpVariants}
        custom={1}
        initial="hidden"
        animate="visible"
        className="mb-5 rounded-2xl border border-gray-100 bg-white shadow-sm px-5 py-5"
      >
        <div className="flex flex-wrap items-start gap-4">
          <span className="text-4xl" aria-hidden="true">{typeConfig.icon}</span>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-900">{typeConfig.label}</h2>
            <p className="mt-1 text-sm text-gray-500">{incident.summary}</p>
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

      {/* High severity alert */}
      {isHighSeverity && (
        <motion.div
          variants={fadeUpVariants}
          custom={2}
          initial="hidden"
          animate="visible"
          className="mb-5"
        >
          <Alert variant="warning">
            This is a <strong>{incident.severity.toLowerCase()}-severity</strong> incident. Consider
            booking a session with a SafeFamily advisor for guided support.
          </Alert>
        </motion.div>
      )}

      {/* Action plan */}
      {actionSteps.length > 0 && (
        <motion.div
          variants={fadeUpVariants}
          custom={3}
          initial="hidden"
          animate="visible"
          className="mb-5 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-5"
        >
          <h3 className="mb-4 text-sm font-semibold text-indigo-800">Recommended Actions</h3>
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

      {/* CTA buttons */}
      <motion.div
        variants={fadeUpVariants}
        custom={4}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap gap-3"
      >
        {isHighSeverity && (
          <Button variant="primary" onClick={() => navigate('/bookings')}>
            <CalendarPlus className="w-4 h-4" aria-hidden="true" />
            Book help
          </Button>
        )}
        <Button variant="outline" onClick={() => navigate('/checklists')}>
          <ListChecks className="w-4 h-4" aria-hidden="true" />
          View checklist
        </Button>
        <Button variant="ghost" onClick={() => navigate('/incidents/report')}>
          <ShieldAlert className="w-4 h-4" aria-hidden="true" />
          Report another
        </Button>
        <Button variant="ghost" onClick={() => navigate('/incidents')}>
          All incidents
        </Button>
      </motion.div>
    </PageLayout>
  )
}

