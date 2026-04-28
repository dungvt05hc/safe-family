import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldAlert, ChevronRight, CalendarClock } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Alert, Badge, Button, LoadingState } from '@/components/ui'
import { NoIncidentsEmpty } from '@/components/ui/entity-empty-states'
import { fadeUpVariants } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { useApiError } from '@/lib/i18n/useApiError'
import {
  INCIDENT_TYPE_CONFIG,
  SEVERITY_BADGE,
  STATUS_BADGE,
  type IncidentResult,
} from '../incidents.types'
import { useIncidents } from '../hooks/useIncidentQueries'

// ── Incident card ─────────────────────────────────────────────────────────────

function IncidentCard({
  incident,
  index,
  onClick,
}: {
  incident: IncidentResult
  index: number
  onClick: () => void
}) {
  const { t } = useTranslation('incidents')
  const typeConfig = INCIDENT_TYPE_CONFIG[incident.type]

  return (
    <motion.button
      type="button"
      custom={index}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -1 }}
      layout
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-2xl border bg-white shadow-sm px-5 py-4 transition-shadow hover:shadow-md',
        incident.status === 'Resolved'  && 'border-green-100',
        incident.status === 'Open'      && 'border-red-100',
        incident.status === 'InProgress' && 'border-amber-100',
        incident.status === 'Dismissed' && 'border-gray-100 opacity-70',
      )}
    >
      <div className="flex items-center gap-4">
        {/* type icon */}
        <span className="text-3xl shrink-0" aria-hidden="true">
          {typeConfig.icon}
        </span>

        {/* content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">{t(`types.${incident.type}.label`, { defaultValue: typeConfig.label })}</p>
            <Badge variant={SEVERITY_BADGE[incident.severity]}>{t(`severity.${incident.severity}.label`, { defaultValue: incident.severity })}</Badge>
            <Badge variant={STATUS_BADGE[incident.status]}>{t(`status.${incident.status}`, { defaultValue: incident.status })}</Badge>
          </div>
          <p className="mt-1 text-xs text-gray-500 truncate">{incident.summary}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-gray-400">
            <CalendarClock className="w-3 h-3" aria-hidden="true" />
            {new Date(incident.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" aria-hidden="true" />
      </div>
    </motion.button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function IncidentSelectPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('incidents')
  const { data: incidents = [], isLoading, isError, error } = useIncidents()
  const loadError = useApiError(error, 'load.incidents')

  return (
    <PageLayout
      title={t('list.pageTitle')}
      description={t('list.pageDescription')}
      action={
        <Button onClick={() => navigate('/incidents/report')}>
          <ShieldAlert className="w-4 h-4" aria-hidden="true" />
          {t('list.reportButton')}
        </Button>
      }
    >
      {isLoading && <LoadingState />}

      {isError && (
        <Alert variant="error">
          {loadError}
        </Alert>
      )}

      {!isLoading && !isError && incidents.length === 0 && (
        <NoIncidentsEmpty onReport={() => navigate('/incidents/report')} />
      )}

      {!isLoading && !isError && incidents.length > 0 && (
        <div className="flex flex-col gap-3">
          {incidents.map((inc, i) => (
            <IncidentCard
              key={inc.id}
              incident={inc}
              index={i}
              onClick={() => navigate(`/incidents/${inc.id}`)}
            />
          ))}
        </div>
      )}
    </PageLayout>
  )
}

