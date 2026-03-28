import { Link } from 'react-router-dom'
import { FileText, BookOpen, FileBarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  INCIDENT_STATUS_COLORS,
  INCIDENT_SEVERITY_COLORS,
  INCIDENT_TYPE_LABELS,
  formatIncidentStatus,
} from '../admin.badges'
import type { AdminIncidentRow, IncidentStatus } from './adminIncidents.types'

interface Props {
  incidents: AdminIncidentRow[]
  onOpen: (id: string) => void
  onStatusChange: (id: string, status: IncidentStatus) => void
  isMutating: boolean
}

const TRIAGE_ACTIONS: { from: IncidentStatus; to: IncidentStatus; label: string; cls: string }[] = [
  {
    from: 'Open',
    to: 'InProgress',
    label: 'Triage',
    cls: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
  },
  {
    from: 'InProgress',
    to: 'Resolved',
    label: 'Resolve',
    cls: 'bg-green-50 text-green-700 hover:bg-green-100',
  },
  {
    from: 'Open',
    to: 'Dismissed',
    label: 'Dismiss',
    cls: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
  },
  {
    from: 'InProgress',
    to: 'Dismissed',
    label: 'Dismiss',
    cls: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
  },
]

export function AdminIncidentsTable({ incidents, onOpen, onStatusChange, isMutating }: Props) {
  return (
    <table className="w-full text-sm" aria-label="Incidents">
      <thead className="bg-gray-50 text-left">
        <tr>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Customer</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Type</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Severity</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Status</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Summary</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Reported</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Related</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600 sr-only">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {incidents.map((inc) => {
          const actions = TRIAGE_ACTIONS.filter((a) => a.from === inc.status)
          return (
            <tr key={inc.id} className="hover:bg-gray-50">
              {/* Customer */}
              <td className="px-4 py-3">
                <Link
                  to={`/admin/customers/${inc.familyId}`}
                  className="font-medium text-amber-600 hover:text-amber-700 hover:underline"
                >
                  {inc.familyName}
                </Link>
              </td>

              {/* Type */}
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                {INCIDENT_TYPE_LABELS[inc.type] ?? inc.type}
              </td>

              {/* Severity */}
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                    INCIDENT_SEVERITY_COLORS[inc.severity],
                  )}
                >
                  {inc.severity}
                </span>
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                    INCIDENT_STATUS_COLORS[inc.status],
                  )}
                >
                  {formatIncidentStatus(inc.status)}
                </span>
              </td>

              {/* Summary */}
              <td
                className="px-4 py-3 text-gray-500 max-w-xs truncate"
                title={inc.summary}
              >
                {inc.summary}
              </td>

              {/* Created date */}
              <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                {new Date(inc.createdAt).toLocaleDateString()}
              </td>

              {/* Related booking / report */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {inc.relatedBookingId ? (
                    <Link
                      to={`/admin/bookings`}
                      title={`Related booking: ${inc.relatedBookingId}`}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      Booking
                    </Link>
                  ) : inc.relatedReportId ? (
                    <Link
                      to={`/admin/reports`}
                      title={`Related report: ${inc.relatedReportId}`}
                      className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 hover:underline"
                    >
                      <FileBarChart2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Report
                    </Link>
                  ) : (
                    <span className="text-gray-300" aria-label="None">—</span>
                  )}
                </div>
              </td>

              {/* Actions */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {actions.map((a) => (
                    <button
                      key={a.to}
                      type="button"
                      disabled={isMutating}
                      onClick={() => onStatusChange(inc.id, a.to)}
                      aria-label={`${a.label} incident for ${inc.familyName}`}
                      className={cn(
                        'rounded px-2 py-1 text-xs font-medium disabled:opacity-40',
                        a.cls,
                      )}
                    >
                      {a.label}
                    </button>
                  ))}

                  {/* Open detail drawer */}
                  <button
                    type="button"
                    onClick={() => onOpen(inc.id)}
                    aria-label={`Open details for incident from ${inc.familyName}`}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                  >
                    <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                    Details
                  </button>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
