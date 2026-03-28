import { useEffect, useRef } from 'react'
import { X, ExternalLink, FileText, AlertTriangle, BookOpen, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  REPORT_TYPE_LABELS,
  REPORT_TYPE_COLORS,
  INCIDENT_TYPE_LABELS,
  INCIDENT_STATUS_LABELS,
  INCIDENT_SEVERITY_COLORS,
  INCIDENT_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
} from '../admin.badges'
import { AdminSpinner, AdminError } from '../components/AdminStateViews'
import { useAdminReportDetail } from './adminReports.hooks'
import { adminReportsApi } from './adminReports.api'

interface Props {
  reportId: string | null
  onClose: () => void
}

const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'
const fieldRow = 'flex justify-between items-start gap-2 text-sm'

export function AdminReportDetailPanel({ reportId, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const open = !!reportId

  const { data: report, isLoading, isError, refetch } = useAdminReportDetail(reportId)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) {
      if (!el.open) el.showModal()
    } else {
      if (el.open) el.close()
    }
  }, [open])

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onClose={onClose}
      aria-modal="true"
      aria-label={report ? `Report: ${report.title}` : 'Report detail'}
      className={cn(
        'fixed inset-y-0 right-0 m-0 h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl',
        'backdrop:bg-black/40',
        'open:flex open:flex-col',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 sticky top-0 bg-white z-10">
        <h2 className="text-lg font-semibold text-gray-900">Report Detail</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 space-y-6">
        {isLoading ? (
          <AdminSpinner />
        ) : isError ? (
          <AdminError message="Failed to load report." onRetry={() => refetch()} />
        ) : !report ? null : (
          <>
            {/* ── Report summary card ─────────────────────────────── */}
            <section aria-labelledby="report-summary-heading">
              <h3 id="report-summary-heading" className="sr-only">Report summary</h3>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3 text-sm">

                <div className={fieldRow}>
                  <span className="text-gray-500 shrink-0">Title</span>
                  <span className="font-medium text-gray-900 text-right">{report.title}</span>
                </div>

                {report.description && (
                  <div className="space-y-1">
                    <span className="text-gray-500">Description</span>
                    <p className="text-gray-800">{report.description}</p>
                  </div>
                )}

                <div className={fieldRow}>
                  <span className="text-gray-500 shrink-0">Type</span>
                  <span
                    className={cn(
                      'inline-flex px-2 py-0.5 rounded-full text-xs font-medium border',
                      REPORT_TYPE_COLORS[report.reportType],
                    )}
                  >
                    {REPORT_TYPE_LABELS[report.reportType] ?? report.reportType}
                  </span>
                </div>

                <div className={fieldRow}>
                  <span className="text-gray-500 shrink-0">Family</span>
                  <Link
                    to={`/admin/customers/${report.familyId}`}
                    className="font-medium text-amber-600 hover:underline inline-flex items-center gap-1"
                  >
                    {report.familyName}
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>

                <div className={fieldRow}>
                  <span className="text-gray-500 shrink-0">Generated</span>
                  <span className="inline-flex items-center gap-1 text-gray-700">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                    {new Date(report.generatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </section>

            {/* ── Download action ─────────────────────────────────── */}
            <section aria-labelledby="report-actions-heading">
              <h3 id="report-actions-heading" className={labelClass}>File</h3>
              {report.fileUrl ? (
                <div className="flex items-center gap-3">
                  <a
                    href={adminReportsApi.downloadUrl(report.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <FileText className="w-4 h-4" aria-hidden="true" />
                    Download report
                  </a>
                  <a
                    href={report.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    Open direct link
                  </a>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No file attached to this report.</p>
              )}
            </section>

            {/* ── Linked incident ─────────────────────────────────── */}
            {report.linkedIncident && (
              <section aria-labelledby="linked-incident-heading">
                <h3 id="linked-incident-heading" className={labelClass}>
                  Linked incident
                </h3>
                <div className="rounded-lg border border-gray-100 bg-red-50 p-4 space-y-2 text-sm">
                  <div className={fieldRow}>
                    <span className="text-gray-500 shrink-0">Type</span>
                    <span className="text-gray-800">
                      {INCIDENT_TYPE_LABELS[report.linkedIncident.type] ?? report.linkedIncident.type}
                    </span>
                  </div>
                  <div className={fieldRow}>
                    <span className="text-gray-500 shrink-0">Severity</span>
                    <span
                      className={cn(
                        'inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                        INCIDENT_SEVERITY_COLORS[report.linkedIncident.severity],
                      )}
                    >
                      {report.linkedIncident.severity}
                    </span>
                  </div>
                  <div className={fieldRow}>
                    <span className="text-gray-500 shrink-0">Status</span>
                    <span
                      className={cn(
                        'inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                        INCIDENT_STATUS_COLORS[report.linkedIncident.status],
                      )}
                    >
                      {INCIDENT_STATUS_LABELS[report.linkedIncident.status] ?? report.linkedIncident.status}
                    </span>
                  </div>
                  <div className="space-y-1 pt-1 border-t border-gray-200">
                    <span className="text-gray-500">Summary</span>
                    <p className="text-gray-800">{report.linkedIncident.summary}</p>
                  </div>
                  <Link
                    to="/admin/incidents"
                    className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline mt-1"
                  >
                    <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                    View in incidents
                  </Link>
                </div>
              </section>
            )}

            {/* ── Linked booking ──────────────────────────────────── */}
            {report.linkedBooking && (
              <section aria-labelledby="linked-booking-heading">
                <h3 id="linked-booking-heading" className={labelClass}>
                  Linked booking
                </h3>
                <div className="rounded-lg border border-gray-100 bg-blue-50 p-4 space-y-2 text-sm">
                  <div className={fieldRow}>
                    <span className="text-gray-500 shrink-0">Package</span>
                    <span className="font-medium text-gray-900">{report.linkedBooking.packageName}</span>
                  </div>
                  <div className={fieldRow}>
                    <span className="text-gray-500 shrink-0">Status</span>
                    <span
                      className={cn(
                        'inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                        BOOKING_STATUS_COLORS[report.linkedBooking.status],
                      )}
                    >
                      {BOOKING_STATUS_LABELS[report.linkedBooking.status] ?? report.linkedBooking.status}
                    </span>
                  </div>
                  <div className={fieldRow}>
                    <span className="text-gray-500 shrink-0">Created</span>
                    <span className="text-gray-700">
                      {new Date(report.linkedBooking.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    to="/admin/bookings"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                  >
                    <BookOpen className="w-3 h-3" aria-hidden="true" />
                    View in bookings
                  </Link>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </dialog>
  )
}
