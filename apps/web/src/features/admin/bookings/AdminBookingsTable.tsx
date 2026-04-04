import { Link } from 'react-router-dom'
import { FileText, AlertCircle, ClipboardCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
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

export function AdminBookingsTable({ bookings, onOpen, onStatusChange, isMutating }: Props) {
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
        {bookings.map((b) => (
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

            {/* Package */}
            <td className="px-4 py-3">
              <p className="text-gray-800">{b.packageName}</p>
              <p className="text-xs text-gray-400">{b.snapshotPackageCode}</p>
            </td>

            {/* Source */}
            <td className="px-4 py-3">
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                {SOURCE_ICON[b.source]}
                {SOURCE_LABEL[b.source]}
              </span>
              {b.sourceIncidentId && (
                <Link
                  to={`/admin/incidents/${b.sourceIncidentId}`}
                  className="block text-xs text-amber-600 hover:underline mt-0.5"
                  aria-label="View linked incident"
                >
                  View incident &rarr;
                </Link>
              )}
            </td>

            {/* Preferred Date */}
            <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
              <p>{new Date(b.preferredStartAt).toLocaleDateString()}</p>
              {b.scheduledStartAt && (
                <p className="text-purple-600 font-medium mt-0.5">
                  Sched: {new Date(b.scheduledStartAt).toLocaleDateString()}
                </p>
              )}
            </td>

            {/* Payment */}
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
            </td>

            {/* Booking Status */}
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

            {/* Assigned To */}
            <td className="px-4 py-3 text-gray-500 text-xs max-w-[120px] truncate">
              {b.assignedAdminEmail ?? <Dash />}
            </td>

            {/* Actions */}
            <td className="px-4 py-3">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Quick confirm: Paid → Confirmed */}
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

                {/* Open detail drawer */}
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
        ))}
      </tbody>
    </table>
  )
}

