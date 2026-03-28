import { FileText, ExternalLink, Eye, AlertTriangle, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { REPORT_TYPE_LABELS, REPORT_TYPE_COLORS } from '../admin.badges'
import { adminReportsApi } from './adminReports.api'
import type { AdminReportRow } from './adminReports.types'

interface Props {
  reports: AdminReportRow[]
  onSelect: (id: string) => void
  selectedId: string | null
}

export function AdminReportsTable({ reports, onSelect, selectedId }: Props) {
  return (
    <table className="w-full text-sm" aria-label="Reports list">
      <thead>
        <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <th scope="col" className="px-4 py-3 text-left">Title</th>
          <th scope="col" className="px-4 py-3 text-left">Family</th>
          <th scope="col" className="px-4 py-3 text-left">Type</th>
          <th scope="col" className="px-4 py-3 text-left">Generated</th>
          <th scope="col" className="px-4 py-3 text-left">Links</th>
          <th scope="col" className="px-4 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {reports.map((report) => (
          <tr
            key={report.id}
            className={cn(
              'hover:bg-amber-50 transition-colors cursor-pointer',
              selectedId === report.id && 'bg-amber-50',
            )}
            onClick={() => onSelect(report.id)}
            aria-selected={selectedId === report.id}
          >
            {/* Title + description */}
            <td className="px-4 py-3 max-w-[220px]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                <span className="font-medium text-gray-900 truncate">{report.title}</span>
              </div>
              {report.description && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">{report.description}</p>
              )}
            </td>

            {/* Family */}
            <td className="px-4 py-3">
              <Link
                to={`/admin/customers/${report.familyId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-amber-600 hover:underline inline-flex items-center gap-1"
              >
                {report.familyName}
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </Link>
            </td>

            {/* Type badge */}
            <td className="px-4 py-3">
              <span
                className={cn(
                  'inline-flex px-2 py-0.5 rounded-full text-xs font-medium border',
                  REPORT_TYPE_COLORS[report.reportType],
                )}
              >
                {REPORT_TYPE_LABELS[report.reportType] ?? report.reportType}
              </span>
            </td>

            {/* Generated date */}
            <td className="px-4 py-3 whitespace-nowrap text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                {new Date(report.generatedAt).toLocaleDateString()}
              </span>
            </td>

            {/* Linked entities */}
            <td className="px-4 py-3">
              <div className="flex flex-col gap-0.5 text-xs text-gray-500">
                {report.incidentId ? (
                  <Link
                    to={`/admin/incidents`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-red-600 hover:underline"
                    title={`Incident: ${report.incidentId}`}
                  >
                    <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                    Incident
                  </Link>
                ) : null}
                {report.bookingId ? (
                  <Link
                    to={`/admin/bookings`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                    title={`Booking: ${report.bookingId}`}
                  >
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    Booking
                  </Link>
                ) : null}
                {!report.incidentId && !report.bookingId && (
                  <span aria-label="No linked context">—</span>
                )}
              </div>
            </td>

            {/* Actions */}
            <td className="px-4 py-3 text-right">
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onSelect(report.id) }}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-amber-400 outline-none"
                  aria-label={`View details for ${report.title}`}
                >
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  View
                </button>
                {report.fileUrl && (
                  <a
                    href={adminReportsApi.downloadUrl(report.id)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-amber-400 outline-none"
                    aria-label={`Download ${report.title}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    Download
                  </a>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
