import { Link } from 'react-router-dom'
import { FileText, AlertCircle, ClipboardCheck, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import {
  BOOKING_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  formatBookingStatus,
} from '../admin.badges'
import type { AdminBookingRow, BookingStatus, BookingSource } from './adminBookings.types'

interface Props {
  bookings: AdminBookingRow[]
  onOpen: (id: string) => void
  onStatusChange: (id: string, status: BookingStatus) => void
  onAssign: (id: string, adminId: string | null, adminEmail: string | null) => void
  isMutating: boolean
}

function Dash() {
  return <span className="text-gray-400" aria-label="Not available">—</span>
}

const SOURCE_ICON: Record<BookingSource, React.ReactNode> = {
  Direct:             null,
  IncidentFollowUp:   <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" aria-hidden="true" />,
  AssessmentFollowUp: <ClipboardCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" aria-hidden="true" />,
  AdminCreated:       null,
}

const SOURCE_LABEL: Record<BookingSource, string> = {
  Direct:             'Direct',
  IncidentFollowUp:   'Incident',
  AssessmentFollowUp: 'Assessment',
  AdminCreated:       'Admin',
}

function formatDuration(minutes: number): string {
  return minutes >= 60 ? `${minutes / 60}h` : `${minutes}m`
}

export function AdminBookingsTable({ bookings, onOpen, onStatusChange, onAssign, isMutating }: Props) {
  const { data: currentUser } = useCurrentUser()

  return (
    <table className="w-full text-sm" aria-label="Bookings">
      <thead className="bg-gray-50 text-left">
        <tr>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Customer</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Package</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Source</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Date</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Payment</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Status</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Assigned</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600 sr-only">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {bookings.map((b) => {
          const isAssignedToMe = currentUser != null && b.assignedAdminUserId === currentUser.id
          const canAssignToMe  = currentUser != null && !isAssignedToMe
          const durationLabel  = formatDuration(b.snapshotDurationMinutes)

          return (
            <tr key={b.id} className="hover:bg-gray-50 align-top">

              {/* Customer */}
              <td className="px-4 py-3">
                <Link
                  to={`/admin/customers/${b.familyId}`}
                  className="font-medium text-amber-600 hover:text-amber-700 hover:underline"
                >
                  {b.familyName}
                </Link>
              </td>

              {/* Package — name + snapshot code / price / duration */}
              <td className="px-4 py-3">
                <p className="text-gray-800">{b.packageName}</p>
                <p className="text-xs text-gray-400">
                  {b.snapshotPackageCode}
                  <span className="mx-1 text-gray-300">·</span>
                  {durationLabel}
                  <span className="mx-1 text-gray-300">·</span>
                  {b.snapshotCurrency} {b.snapshotPrice.toLocaleString()}
                </p>
              </td>

              {/* Source — label + links to linked incident/assessment */}
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  {SOURCE_ICON[b.source]}
                  {SOURCE_LABEL[b.source]}
                </span>
                {b.sourceIncidentId && (
                  <Link
                    to={`/admin/incidents/${b.sourceIncidentId}`}
                    className="block text-xs text-red-600 hover:underline mt-0.5"
                    aria-label="View linked incident"
                  >
                    View incident &rarr;
                  </Link>
                )}
                {b.sourceAssessmentId && (
                  <Link
                    to={`/admin/assessments/${b.sourceAssessmentId}`}
                    className="block text-xs text-indigo-600 hover:underline mt-0.5"
                    aria-label="View linked assessment"
                  >
                    View assessment &rarr;
                  </Link>
                )}
              </td>

              {/* Preferred / confirmed date */}
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                <p>{new Date(b.preferredStartAt).toLocaleDateString()}</p>
                {b.confirmedStartAt && (
                  <p className="text-purple-600 font-medium mt-0.5">
                    Sched: {new Date(b.confirmedStartAt).toLocaleDateString()}
                  </p>
                )}
              </td>

              {/* Payment status + amount + urgency signals */}
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                    PAYMENT_STATUS_COLORS[b.paymentStatus],
                  )}
                >
                  {b.paymentStatus}
                </span>
                {b.latestPayment && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {b.latestPayment.currency} {b.latestPayment.amount.toLocaleString()}
                    {b.latestPayment.gatewayProvider && (
                      <span className="ml-1 text-gray-300">· {b.latestPayment.gatewayProvider}</span>
                    )}
                  </p>
                )}
                {/* Expiry urgency — shown while a payment session is still open */}
                {b.latestPayment?.status === 'Pending' && b.latestPayment.expiresAt && (
                  <p className="text-xs text-orange-500 mt-0.5">
                    Exp.{' '}
                    {new Date(b.latestPayment.expiresAt).toLocaleString(undefined, {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                )}
                {/* Paid-at timestamp — useful when doing reconciliation */}
                {b.latestPayment?.paidAt && (
                  <p className="text-xs text-green-600 mt-0.5">
                    Paid{' '}
                    {new Date(b.latestPayment.paidAt).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric',
                    })}
                  </p>
                )}
              </td>

              {/* Booking status */}
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                    BOOKING_STATUS_COLORS[b.status],
                  )}
                >
                  {formatBookingStatus(b.status)}
                </span>
              </td>

              {/* Assigned admin */}
              <td className="px-4 py-3 text-gray-500 text-xs max-w-[120px]">
                {b.assignedAdminEmail ? (
                  <span className={cn('truncate block', isAssignedToMe && 'text-amber-600 font-medium')}>
                    {isAssignedToMe ? 'Me' : b.assignedAdminEmail}
                  </span>
                ) : (
                  <Dash />
                )}
              </td>

              {/* Row actions */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 flex-wrap">

                  {/* Confirm: Paid → Confirmed */}
                  {b.status === 'Paid' && (
                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={() => onStatusChange(b.id, 'Confirmed')}
                      aria-label={`Confirm booking for ${b.familyName}`}
                      className="rounded px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-40"
                    >
                      Confirm
                    </button>
                  )}

                  {/* Schedule: Confirmed → Scheduled */}
                  {b.status === 'Confirmed' && (
                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={() => onStatusChange(b.id, 'Scheduled')}
                      aria-label={`Schedule booking for ${b.familyName}`}
                      className="rounded px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-40"
                    >
                      Schedule
                    </button>
                  )}

                  {/* Complete: Scheduled or InProgress */}
                  {(b.status === 'Scheduled' || b.status === 'InProgress') && (
                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={() => onStatusChange(b.id, 'Completed')}
                      aria-label={`Complete booking for ${b.familyName}`}
                      className="rounded px-2 py-1 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-40"
                    >
                      Complete
                    </button>
                  )}

                  {/* Assign to me — fast claim without opening the drawer */}
                  {canAssignToMe && (
                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={() => onAssign(b.id, currentUser!.id, currentUser!.email)}
                      aria-label={`Assign booking for ${b.familyName} to me`}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-40"
                    >
                      <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                      Assign me
                    </button>
                  )}

                  {/* Open full detail drawer */}
                  <button
                    type="button"
                    onClick={() => onOpen(b.id)}
                    aria-label={`Open details for ${b.familyName}`}
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

