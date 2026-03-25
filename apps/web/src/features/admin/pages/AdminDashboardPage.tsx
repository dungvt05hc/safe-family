import { useAdminDashboard } from '../hooks/useAdminQueries'

export function AdminDashboardPage() {
  const { data, isLoading, isError } = useAdminDashboard()

  if (isLoading) return <p className="p-6 text-gray-500">Loading…</p>
  if (isError || !data) return <p className="p-6 text-red-500">Failed to load dashboard.</p>

  const stats = [
    { label: 'Total Users', value: data.totalUsers },
    { label: 'Total Families', value: data.totalFamilies },
    { label: 'Total Bookings', value: data.totalBookings },
    { label: 'Pending Bookings', value: data.pendingBookings },
    { label: 'Total Incidents', value: data.totalIncidents },
    { label: 'Open Incidents', value: data.openIncidents },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{s.label}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent audit log */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Recent Audit Log</h2>
        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Action</th>
                <th className="px-4 py-3 font-medium text-gray-600">User</th>
                <th className="px-4 py-3 font-medium text-gray-600">Entity</th>
                <th className="px-4 py-3 font-medium text-gray-600">Details</th>
                <th className="px-4 py-3 font-medium text-gray-600">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.recentAuditLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No audit logs yet.</td>
                </tr>
              )}
              {data.recentAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-blue-700">{log.action}</td>
                  <td className="px-4 py-3 text-gray-700">{log.userEmail ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{log.entityType ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{log.details ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
