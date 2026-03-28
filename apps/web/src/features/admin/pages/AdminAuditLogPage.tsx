import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAdminAuditLogs } from '../hooks/useAdminQueries'
import { AdminSpinner, AdminError, AdminEmpty } from '../components/AdminStateViews'

const PAGE_SIZE = 50

export function AdminAuditLogPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useAdminAuditLogs(page)

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        {data && (
          <span className="text-sm text-gray-500">{data.total.toLocaleString()} entries</span>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        {isLoading ? (
          <AdminSpinner />
        ) : isError ? (
          <AdminError message="Failed to load audit log." />
        ) : !data || data.items.length === 0 ? (
          <AdminEmpty message="No audit entries yet." />
        ) : (
          <table className="w-full text-sm" aria-label="Audit log">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium text-gray-600">Action</th>
                <th scope="col" className="px-4 py-3 font-medium text-gray-600">User</th>
                <th scope="col" className="px-4 py-3 font-medium text-gray-600">Entity</th>
                <th scope="col" className="px-4 py-3 font-medium text-gray-600">Details</th>
                <th scope="col" className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.items.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-blue-700 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{log.userEmail ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {log.entityType
                      ? `${log.entityType}${log.entityId ? ` · ${log.entityId.slice(0, 8)}…` : ''}`
                      : '—'}
                  </td>
                  <td
                    className="px-4 py-3 text-gray-500 max-w-xs truncate"
                    title={log.details ?? ''}
                  >
                    {log.details ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
