import { useNavigate, useParams } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { useIncident } from '../hooks/useIncidentQueries'
import {
  INCIDENT_TYPE_CONFIG,
  SEVERITY_CONFIG,
} from '../incidents.types'

export function IncidentResultPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: incident, isLoading, isError } = useIncident(id ?? '')

  if (isLoading) {
    return (
      <PageLayout title="Incident Report">
        <p className="text-gray-500">Loading your action plan…</p>
      </PageLayout>
    )
  }

  if (isError || !incident) {
    return (
      <PageLayout title="Incident Report">
        <p className="text-red-600">Failed to load incident. Please try again.</p>
      </PageLayout>
    )
  }

  const typeConfig = INCIDENT_TYPE_CONFIG[incident.type]
  const severityConfig = SEVERITY_CONFIG[incident.severity]

  const actionSteps = incident.firstActionPlan
    ? incident.firstActionPlan.split('\n').filter((line) => line.trim().length > 0)
    : []

  return (
    <PageLayout
      title="Incident Action Plan"
      description="Follow the steps below to contain and remediate this incident."
    >
      {/* Incident summary card */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-3xl">{typeConfig.icon}</span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{typeConfig.label}</h2>
            <p className="text-sm text-gray-500">{incident.summary}</p>
          </div>
          <span
            className={`ml-auto inline-block rounded-full px-3 py-1 text-sm font-semibold ${severityConfig.color}`}
          >
            {severityConfig.label}
          </span>
        </div>
      </div>

      {/* Action steps */}
      {actionSteps.length > 0 && (
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-5">
          <h3 className="mb-4 text-base font-semibold text-indigo-800">
            Recommended Actions
          </h3>
          <ol className="space-y-3">
            {actionSteps.map((step, index) => (
              <li key={index} className="flex gap-3 text-sm text-gray-800">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span>{step.replace(/^\d+\.\s*/, '')}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => navigate('/incidents')}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Report Another Incident
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to Dashboard
        </button>
      </div>
    </PageLayout>
  )
}
