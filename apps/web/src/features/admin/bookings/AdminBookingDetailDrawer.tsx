import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { X, Plus, AlertCircle, ClipboardCheck, CreditCard, FileText, ExternalLink, Link2, Link2Off } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useAdminUsers } from '../users/adminUsers.hooks'
import { BOOKING_STATUS_COLORS, PAYMENT_STATUS_COLORS, formatBookingStatus } from '../admin.badges'
import { AdminSpinner, AdminError } from '../components/AdminStateViews'
import { AdminNotesPanel } from '../notes/AdminNotesPanel'
import { useAdminBookingDetail, useAddBookingNote, useLinkBookingReport } from './adminBookings.hooks'
import { adminReportsApi } from '../reports/adminReports.api'
import type { BookingStatus, BookingSource, PaymentStatus } from './adminBookings.types'

const BOOKING_STATUSES: BookingStatus[] = [
  'Draft', 'Submitted', 'Paid', 'Confirmed', 'Scheduled', 'InProgress', 'Completed', 'Cancelled', 'Expired',
]

const PAYMENT_STATUSES: PaymentStatus[] = [
  'Unpaid', 'Pending', 'Paid', 'Failed', 'Expired', 'Refunded', 'PartiallyRefunded',
]

const SOURCE_ICON: Record<BookingSource, React.ReactNode> = {
  Direct:             null,
  IncidentFollowUp:   <AlertCircle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />,
  AssessmentFollowUp: <ClipboardCheck className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" />,
  AdminCreated:       null,
}

const SOURCE_LABEL: Record<BookingSource, string> = {
  Direct:             'Direct booking',
  IncidentFollowUp:   'Follow-up from incident',
  AssessmentFollowUp: 'Follow-up from assessment',
  AdminCreated:       'Created by admin',
}

interface Props {
  bookingId: string | null
  onClose: () => void
  onStatusChange: (id: string, status: BookingStatus) => void
  onPaymentStatusChange: (id: string, status: PaymentStatus) => void
  onAssign: (id: string, adminId: string | null, adminEmail: string | null) => void
  isMutating: boolean
}
const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'
const selectClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400'
const btnSecondary =
  'rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40'
const btnPrimary =
  'rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400'

export function AdminBookingDetailDrawer({
  bookingId,
  onClose,
  onStatusChange,
  onPaymentStatusChange,
  onAssign,
  isMutating,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const open = !!bookingId

  const { data: booking, isLoading, isError, refetch } = useAdminBookingDetail(bookingId)
  const addNoteQuery = useAddBookingNote()
  const linkReportMutation = useLinkBookingReport()
  const { data: currentUser } = useCurrentUser()
  const { data: adminUsers } = useAdminUsers({
    search: '',
    role: 'Admin',
    status: '',
    emailVerified: '',
    page: 1,
    pageSize: 100,
  })

  const [noteContent, setNoteContent] = useState('')
  const [selectedReportId, setSelectedReportId] = useState('')

  // Load family's reports for the link picker whenever the drawer is open
  const { data: familyReports } = useQuery({
    queryKey: ['admin', 'reports', 'family', booking?.familyId],
    queryFn: () => adminReportsApi.getFamilyReports(booking!.familyId),
    enabled: !!booking?.familyId,
    staleTime: 60_000,
  })

  // Open / close the native dialog
  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) {
      if (!el.open) el.showModal()
    } else {
      if (el.open) el.close()
    }
  }, [open])

  // Reset note input when booking changes
  useEffect(() => {
    setNoteContent('')
  }, [bookingId])

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) onClose()
  }

  function handleSubmitNote(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = noteContent.trim()
    if (!trimmed || !booking) return
    addNoteQuery.mutate(
      { id: booking.id, req: { content: trimmed } },
      { onSuccess: () => setNoteContent('') },
    )
  }

  const isAssignedToMe =
    booking?.assignedAdminUserId != null &&
    currentUser != null &&
    booking.assignedAdminUserId === currentUser.id

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onClose={onClose}
      aria-modal="true"
      aria-label={booking ? `Booking for ${booking.familyName}` : 'Booking detail'}
      className={cn(
        'fixed inset-y-0 right-0 m-0 h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl',
        'backdrop:bg-black/40',
        'open:flex open:flex-col',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 sticky top-0 bg-white z-10">
        <h2 className="text-lg font-semibold text-gray-900">Booking Detail</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close drawer"
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
          <AdminError message="Failed to load booking." onRetry={() => refetch()} />
        ) : !booking ? null : (
          <>
            {/* ── Booking summary ─────────────────────────────────────────── */}
            <section aria-labelledby="booking-summary-heading">
              <h3 id="booking-summary-heading" className="sr-only">Booking summary</h3>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Family</span>
                  <Link
                    to={`/admin/customers/${booking.familyId}`}
                    className="font-medium text-amber-600 hover:underline"
                  >
                    {booking.familyName}
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Package</span>
                  <span className="text-gray-800">{booking.packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Preferred Start</span>
                  <span className="text-gray-800">
                    {new Date(booking.preferredStartAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Channel</span>
                  <span className="text-gray-800">{booking.channel}</span>
                </div>
                {booking.confirmedStartAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Scheduled Start</span>
                    <span className="text-purple-700 font-medium">
                      {new Date(booking.confirmedStartAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {booking.confirmedEndAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Scheduled End</span>
                    <span className="text-gray-800">
                      {new Date(booking.confirmedEndAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {booking.internalNotes && (
                  <div className="pt-1 border-t border-gray-200">
                    <span className="text-gray-500 block mb-0.5">Internal notes (legacy)</span>
                    <p className="text-gray-700 whitespace-pre-wrap">{booking.internalNotes}</p>
                  </div>
                )}
                {booking.customerNotes && (
                  <div className="pt-1 border-t border-gray-200">
                    <span className="text-gray-500 block mb-0.5">Customer notes</span>
                    <p className="text-gray-700">{booking.customerNotes}</p>
                  </div>
                )}
              </div>
            </section>

            {/* ── Source context ───────────────────────────────────────────── */}
            {booking.source !== 'Direct' && (
              <section aria-labelledby="source-heading" className="space-y-2">
                <h3 id="source-heading" className={labelClass}>Source</h3>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {SOURCE_ICON[booking.source]}
                    <span className="text-gray-700">{SOURCE_LABEL[booking.source]}</span>
                  </div>
                  {booking.sourceIncidentId && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-gray-500 shrink-0">Incident</span>
                      <div className="text-right">
                        {booking.sourceIncidentSummary && (
                          <p className="text-gray-700 text-xs mb-0.5">{booking.sourceIncidentSummary}</p>
                        )}
                        <Link
                          to={`/admin/incidents/${booking.sourceIncidentId}`}
                          className="text-amber-600 hover:underline text-xs"
                        >
                          View incident &rarr;
                        </Link>
                      </div>
                    </div>
                  )}
                  {booking.sourceAssessmentId && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-gray-500 shrink-0">Assessment</span>
                      <div className="text-right">
                        {booking.sourceAssessmentDate && (
                          <p className="text-gray-700 text-xs mb-0.5">
                            {new Date(booking.sourceAssessmentDate).toLocaleDateString()}
                          </p>
                        )}
                        <Link
                          to={`/admin/assessments/${booking.sourceAssessmentId}`}
                          className="text-amber-600 hover:underline text-xs"
                        >
                          View assessment &rarr;
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ── Payment details ──────────────────────────────────────────── */}
            {(booking.latestPayment || booking.paymentOrders?.length > 0) && (
              <section aria-labelledby="payment-heading" className="space-y-2">
                <h3 id="payment-heading" className={labelClass}>Payment</h3>

                {booking.latestPayment && (
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Latest</span>
                      <span
                        className={cn(
                          'inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                          PAYMENT_STATUS_COLORS[booking.latestPayment.status],
                        )}
                      >
                        {booking.latestPayment.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-medium text-gray-800">
                        {booking.latestPayment.currency} {booking.latestPayment.amount.toLocaleString()}
                      </span>
                    </div>
                    {booking.latestPayment.gatewayProvider && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Provider</span>
                        <span className="text-gray-700">{booking.latestPayment.gatewayProvider}</span>
                      </div>
                    )}
                    {booking.latestPayment.paidAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Paid at</span>
                        <span className="text-green-700">{new Date(booking.latestPayment.paidAt).toLocaleString()}</span>
                      </div>
                    )}
                    {booking.latestPayment.expiresAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Expires at</span>
                        <span className="text-gray-600">{new Date(booking.latestPayment.expiresAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Full payment order history */}
                {booking.paymentOrders && booking.paymentOrders.length > 1 && (
                  <details className="group">
                    <summary className="text-xs text-gray-500 cursor-pointer select-none hover:text-gray-700 flex items-center gap-1 py-1">
                      <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />
                      {booking.paymentOrders.length} payment orders
                    </summary>
                    <ul className="mt-2 space-y-2" aria-label="Payment order history">
                      {booking.paymentOrders.map((order) => (
                        <li
                          key={order.orderId}
                          className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs space-y-1"
                        >
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">
                              {order.currency} {order.amount.toLocaleString()}
                            </span>
                            <span className={cn(
                              'inline-block rounded-full px-2 py-0.5 font-semibold',
                              PAYMENT_STATUS_COLORS[order.status],
                            )}>
                              {order.status}
                            </span>
                          </div>
                          {order.gatewayProvider && (
                            <p className="text-gray-400">{order.gatewayProvider}</p>
                          )}
                          <p className="text-gray-400">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </section>
            )}

            {/* ── Related reports ──────────────────────────────────────────── */}
            <section aria-labelledby="reports-heading" className="space-y-3">
              <h3 id="reports-heading" className={labelClass}>Linked Report</h3>

              {/* Currently linked reports */}
              {booking.relatedReports && booking.relatedReports.length > 0 ? (
                <ul className="space-y-2" aria-label="Linked reports">
                  {booking.relatedReports.map((report) => (
                    <li
                      key={report.reportId}
                      className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm flex items-start justify-between gap-2"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{report.title}</p>
                          {report.description && (
                            <p className="text-xs text-gray-500 line-clamp-2">{report.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">
                            {report.reportType} &middot; {new Date(report.generatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {report.fileUrl && (
                          <a
                            href={report.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline"
                            aria-label={`Open report: ${report.title}`}
                          >
                            <ExternalLink className="w-3 h-3" aria-hidden="true" />
                            Open
                          </a>
                        )}
                        <button
                          type="button"
                          disabled={linkReportMutation.isPending}
                          onClick={() => bookingId && linkReportMutation.mutate({ id: bookingId, req: { reportId: null } })}
                          className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                          aria-label={`Unlink report: ${report.title}`}
                        >
                          <Link2Off className="w-3 h-3" aria-hidden="true" />
                          Unlink
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400">No report linked.</p>
              )}

              {/* Link a new report */}
              {familyReports && familyReports.items.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedReportId}
                    onChange={(e) => setSelectedReportId(e.target.value)}
                    className="flex-1 rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 focus:border-amber-400 focus:outline-none"
                    aria-label="Select report to link"
                  >
                    <option value="">— select a report —</option>
                    {familyReports.items.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.reportType}, {new Date(r.generatedAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!selectedReportId || linkReportMutation.isPending}
                    onClick={() => {
                      if (bookingId && selectedReportId) {
                        linkReportMutation.mutate(
                          { id: bookingId, req: { reportId: selectedReportId } },
                          { onSuccess: () => setSelectedReportId('') },
                        )
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded bg-amber-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Link2 className="w-3 h-3" aria-hidden="true" />
                    Link
                  </button>
                </div>
              )}
            </section>

            {/* ── Status controls ──────────────────────────────────────────── */}
            <section aria-labelledby="status-heading" className="space-y-4">
              <h3 id="status-heading" className={labelClass}>Status</h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="booking-status-select" className="block text-xs text-gray-500 mb-1">
                    Booking status
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      id="booking-status-select"
                      value={booking.status}
                      disabled={isMutating}
                      onChange={(e) =>
                        onStatusChange(booking.id, e.target.value as BookingStatus)
                      }
                      className={selectClass}
                    >
                      {BOOKING_STATUSES.map((s) => (
                        <option key={s} value={s}>{formatBookingStatus(s)}</option>
                      ))}
                    </select>
                    <span
                      className={cn(
                        'shrink-0 inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                        BOOKING_STATUS_COLORS[booking.status],
                      )}
                      aria-hidden="true"
                    >
                      {formatBookingStatus(booking.status)}
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="payment-status-select" className="block text-xs text-gray-500 mb-1">
                    Payment status
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      id="payment-status-select"
                      value={booking.paymentStatus}
                      disabled={isMutating}
                      onChange={(e) =>
                        onPaymentStatusChange(booking.id, e.target.value as PaymentStatus)
                      }
                      className={selectClass}
                    >
                      {PAYMENT_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <span
                      className={cn(
                        'shrink-0 inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                        PAYMENT_STATUS_COLORS[booking.paymentStatus],
                      )}
                      aria-hidden="true"
                    >
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Assign ───────────────────────────────────────────────────── */}
            <section aria-labelledby="assign-heading" className="space-y-3">
              <h3 id="assign-heading" className={labelClass}>Assigned Admin</h3>

              {booking.assignedAdminEmail ? (
                <p className="text-sm text-gray-700">
                  {booking.assignedAdminEmail}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">Unassigned</p>
              )}

              {/* Assign dropdown */}
              <div>
                <label htmlFor="assign-select" className="block text-xs text-gray-500 mb-1">
                  Assign to
                </label>
                <select
                  id="assign-select"
                  disabled={isMutating}
                  value={booking.assignedAdminUserId?.toString() ?? ''}
                  onChange={(e) => {
                    const selected = adminUsers?.items.find((u) => u.id === e.target.value)
                    onAssign(
                      booking.id,
                      selected?.id ?? null,
                      selected?.email ?? null,
                    )
                  }}
                  className={selectClass}
                >
                  <option value="">— Unassigned —</option>
                  {adminUsers?.items.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.displayName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick "Assign to me" shortcut */}
              {currentUser && !isAssignedToMe && (
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={() => onAssign(booking.id, currentUser.id, currentUser.email)}
                  className={btnSecondary}
                >
                  Assign to me
                </button>
              )}
            </section>

            {/* ── Internal notes ───────────────────────────────────────────── */}
            <section aria-labelledby="notes-heading" className="space-y-3">
              <h3 id="notes-heading" className={labelClass}>Internal Notes</h3>

              {booking.bookingNotes.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No notes yet.</p>
              ) : (
                <ul className="space-y-3" aria-label="Admin notes">
                  {booking.bookingNotes.map((note) => (
                    <li
                      key={note.noteId}
                      className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm"
                    >
                      <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                      <p className="mt-1.5 text-xs text-gray-400">
                        {note.authorEmail} &middot; {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {/* Add note form */}
              <form onSubmit={handleSubmitNote} className="space-y-2" aria-label="Add note form">
                <label htmlFor="note-input" className="text-xs text-gray-500">
                  Add a note (visible to admins only)
                </label>
                <textarea
                  id="note-input"
                  rows={3}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  maxLength={2000}
                  placeholder="Write an internal note…"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400 resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {noteContent.length}/2000
                  </span>
                  <button
                    type="submit"
                    disabled={addNoteQuery.isPending || noteContent.trim().length === 0}
                    className={cn(btnPrimary, 'inline-flex items-center gap-1')}
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    Add note
                  </button>
                </div>
              </form>
            </section>

            {/* ── Admin Notes (cross-entity) ───────────────────────────────── */}
            <section className="space-y-3">
              <AdminNotesPanel bookingId={booking.id} title="Admin Notes" limit={10} />
            </section>

            {/* ── Event timeline ───────────────────────────────────────────── */}
            {booking.events && booking.events.length > 0 && (
              <section aria-labelledby="events-heading" className="space-y-2">
                <h3 id="events-heading" className={labelClass}>Activity</h3>
                <ol className="space-y-2 text-xs text-gray-500" aria-label="Booking event history">
                  {booking.events.map((ev) => (
                    <li key={ev.eventId} className="flex gap-3">
                      <span
                        className="mt-1 w-2 h-2 rounded-full bg-amber-400 shrink-0"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-medium text-gray-700">{ev.eventType}</p>
                        {ev.fromValue && ev.toValue && (
                          <p>{ev.fromValue} &rarr; {ev.toValue}</p>
                        )}
                        <p className="text-gray-400">
                          {ev.actorEmail ?? 'System'}
                          &nbsp;&middot;&nbsp;
                          {new Date(ev.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* ── Timestamps ───────────────────────────────────────────────── */}
            <footer className="text-xs text-gray-400 space-y-0.5">
              <p>Created {new Date(booking.createdAt).toLocaleString()}</p>
              <p>Updated {new Date(booking.updatedAt).toLocaleString()}</p>
            </footer>
          </>
        )}
      </div>
    </dialog>
  )
}
