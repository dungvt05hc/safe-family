import type { AuditLogEntry } from '../admin.types'
import { getActionColor, formatActionLabel } from './adminActivity.types'

interface AdminActivityTableProps {
  items: AuditLogEntry[]
}

export function AdminActivityTable({ items }: AdminActivityTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
      <table className="w-full text-sm" aria-label="System activity">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium text-gray-600">
              Activity
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-gray-600">
              User
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-gray-600">
              Entity
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-gray-600">
              Summary
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">
              Time
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getActionColor(entry.action)}`}
                >
                  {formatActionLabel(entry.action)}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700">
                {entry.userEmail ?? <span className="text-gray-400">—</span>}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {entry.entityType ? (
                  <span className="font-mono text-xs">
                    {entry.entityType}
                    {entry.entityId && (
                      <span className="text-gray-400"> · {entry.entityId.slice(0, 8)}…</span>
                    )}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td
                className="px-4 py-3 text-gray-500 max-w-xs truncate"
                title={entry.details || undefined}
              >
                {entry.details ?? <span className="text-gray-400">—</span>}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <time
                  dateTime={entry.createdAt}
                  className="text-gray-400 text-xs"
                >
                  {new Date(entry.createdAt).toLocaleString()}
                </time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
