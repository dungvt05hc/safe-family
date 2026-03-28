import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import type { DashboardIncidentRow } from '../admin.types'
import { INCIDENT_SEVERITY_COLORS, INCIDENT_STATUS_COLORS, INCIDENT_TYPE_LABELS } from '../admin.badges'
import { AdminEmpty } from './AdminStateViews'

interface AdminRecentIncidentsProps {
  incidents: DashboardIncidentRow[]
}

export function AdminRecentIncidents({ incidents }: AdminRecentIncidentsProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Recent Incidents</h2>
        <Link
          to="/admin/incidents"
          className="text-xs font-medium text-amber-600 hover:text-amber-700 hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm" aria-label="Recent incidents">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium text-gray-600">Family</th>
              <th scope="col" className="px-4 py-3 font-medium text-gray-600">Type</th>
              <th scope="col" className="px-4 py-3 font-medium text-gray-600">Summary</th>
              <th scope="col" className="px-4 py-3 font-medium text-gray-600">Severity</th>
              <th scope="col" className="px-4 py-3 font-medium text-gray-600">Status</th>
              <th scope="col" className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Reported</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <AdminEmpty
                    icon={<AlertTriangle className="h-8 w-8" />}
                    message="No incidents reported."
                  />
                </td>
              </tr>
            ) : (
              incidents.map((i) => (
                <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{i.familyName}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {INCIDENT_TYPE_LABELS[i.type]}
                  </td>
                  <td
                    className="px-4 py-3 text-gray-600 max-w-xs truncate"
                    title={i.summary}
                  >
                    {i.summary}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${INCIDENT_SEVERITY_COLORS[i.severity]}`}>
                      {i.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${INCIDENT_STATUS_COLORS[i.status]}`}>
                      {i.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(i.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
