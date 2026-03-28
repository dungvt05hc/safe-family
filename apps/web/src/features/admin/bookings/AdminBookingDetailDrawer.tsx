import { useEffect, useRef, useState } from 'react'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useAdminUsers } from '../users/adminUsers.hooks'
import { BOOKING_STATUS_COLORS, PAYMENT_STATUS_COLORS, formatBookingStatus } from '../admin.badges'
import { AdminSpinner, AdminError } from '../components/AdminStateViews'
import { AdminNotesPanel } from '../notes/AdminNotesPanel'
import { useAdminBookingDetail, useAddBookingNote } from './adminBookings.hooks'
import type { BookingStatus, PaymentStatus } from './adminBookings.types'

const BOOKING_STATUSES: BookingStatus[] = [
  'Pending', 'Confirmed', 'InProgress', 'Cancelled', 'Completed',
]

const PAYMENT_STATUSES: PaymentStatus[] = ['Pending', 'Paid', 'Refunded', 'Waived']

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
    booking?.assignedAdminId != null &&
    currentUser != null &&
    booking.assignedAdminId === currentUser.id

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
                  <span className="font-medium text-gray-900">{booking.familyName}</span>
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
                {booking.notes && (
                  <div className="pt-1 border-t border-gray-200">
                    <span className="text-gray-500 block mb-0.5">Customer notes</span>
                    <p className="text-gray-700">{booking.notes}</p>
                  </div>
                )}
              </div>
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
                  value={booking.assignedAdminId ?? ''}
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
