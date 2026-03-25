import { useAdminIncidents } from '../hooks/useAdminQueries'
import { useUpdateIncidentStatus } from '../hooks/useAdminMutations'
import type { IncidentStatus } from '../admin.types'

const INCIDENT_STATUSES: IncidentStatus[] = ['Open', 'InProgress', 'Resolved', 'Dismissed']

const statusColors: Record<IncidentStatus, string> = {
  Open: 'bg-red-100 text-red-700',
  InProgress: 'bg-yellow-100 text-yellow-700',
  Resolved: 'bg-green-100 text-green-700',
  Dismissed: 'bg-gray-100 text-gray-500',
}

export function AdminIncidentsPage() {
  const { data, isLoading, isError } = useAdminIncidents()
  const updateStatus = useUpdateIncidentStatus()

  if (isLoading) return <p className="p-6 text-gray-500">Loading…</p>
  if (isError || !data) return <p className="p-6 text-red-500">Failed to load incidents.</p>

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Incident Queue</h1>
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Family</th>
              <th className="px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="px-4 py-3 font-medium text-gray-600">Severity</th>
              <th className="px-4 py-3 font-medium text-gray-600">Summary</th>
              <th className="px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 font-medium text-gray-600">Reported</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">No incidents yet.</td>
              </tr>
            )}
            {data.map((inc) => (
              <tr key={inc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{inc.familyName}</td>
                <td className="px-4 py-3 text-gray-700">{inc.type}</td>
                <td className="px-4 py-3 text-gray-500">{inc.severity}</td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate" title={inc.summary}>
                  {inc.summary}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={inc.status}
                    disabled={updateStatus.isPending}
                    onChange={(e) =>
                      updateStatus.mutate({ id: inc.id, status: e.target.value as IncidentStatus })
                    }
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold border-0 cursor-pointer focus:ring-2 focus:ring-blue-400 ${statusColors[inc.status]}`}
                  >
                    {INCIDENT_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-400">{new Date(inc.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
