import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import {
  INCIDENT_TYPE_CONFIG,
  type IncidentType,
} from '../incidents.types'

export function IncidentSelectPage() {
  const navigate = useNavigate()

  function handleSelect(type: IncidentType) {
    navigate('/incidents/report', { state: { type } })
  }

  return (
    <PageLayout
      title="Report an Incident"
      description="Select the type of security incident your family has experienced."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(INCIDENT_TYPE_CONFIG) as IncidentType[]).map((type) => {
          const config = INCIDENT_TYPE_CONFIG[type]
          return (
            <button
              key={type}
              onClick={() => handleSelect(type)}
              className="flex flex-col items-start gap-2 rounded-lg border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-indigo-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span className="text-3xl">{config.icon}</span>
              <span className="font-semibold text-gray-900">{config.label}</span>
              <span className="text-sm text-gray-500">{config.description}</span>
            </button>
          )
        })}
      </div>
    </PageLayout>
  )
}
