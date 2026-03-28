import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BOOKING_STATUS_COLORS, PAYMENT_STATUS_COLORS, formatBookingStatus } from '../admin.badges'
import type { AdminBookingRow, BookingStatus } from './adminBookings.types'

interface Props {
  bookings: AdminBookingRow[]
  onOpen: (id: string) => void
  onStatusChange: (id: string, status: BookingStatus) => void
  isMutating: boolean
}

function Dash() {
  return <span className="text-gray-400" aria-label="Not available">—</span>
}

export function AdminBookingsTable({ bookings, onOpen, onStatusChange, isMutating }: Props) {
  return (
    <table className="w-full text-sm" aria-label="Bookings">
      <thead className="bg-gray-50 text-left">
        <tr>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Customer</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Package</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Preferred Date</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Channel</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Payment</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Status</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Assigned To</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600 sr-only">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {bookings.map((b) => (
          <tr key={b.id} className="hover:bg-gray-50">
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
            <td className="px-4 py-3 text-gray-700">{b.packageName}</td>

            {/* Preferred Date */}
            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
              {new Date(b.preferredStartAt).toLocaleDateString()}
            </td>

            {/* Channel */}
            <td className="px-4 py-3 text-gray-500">{b.channel}</td>

            {/* Payment Status */}
            <td className="px-4 py-3">
              <span
                className={cn(
                  'inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                  PAYMENT_STATUS_COLORS[b.paymentStatus],
                )}
              >
                {b.paymentStatus}
              </span>
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
            <td className="px-4 py-3 text-gray-500 text-xs">
              {b.assignedAdminEmail ?? <Dash />}
            </td>

            {/* Actions */}
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                {/* Quick status transitions */}
                {b.status === 'Pending' && (
                  <button
                    type="button"
                    disabled={isMutating}
                    onClick={() => onStatusChange(b.id, 'Confirmed')}
                    aria-label={`Confirm booking for ${b.familyName}`}
                    className="rounded px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-40"
                  >
                    Confirm
                  </button>
                )}
                {(b.status === 'Confirmed' || b.status === 'InProgress') && (
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
