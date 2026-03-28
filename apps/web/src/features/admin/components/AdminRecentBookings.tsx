import { Link } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import type { DashboardBookingRow } from '../admin.types'
import { BOOKING_STATUS_COLORS, PAYMENT_STATUS_COLORS } from '../admin.badges'
import { AdminEmpty } from './AdminStateViews'

interface AdminRecentBookingsProps {
  bookings: DashboardBookingRow[]
}

export function AdminRecentBookings({ bookings }: AdminRecentBookingsProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Recent Bookings</h2>
        <Link
          to="/admin/bookings"
          className="text-xs font-medium text-amber-600 hover:text-amber-700 hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm" aria-label="Recent bookings">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium text-gray-600">Family</th>
              <th scope="col" className="px-4 py-3 font-medium text-gray-600">Package</th>
              <th scope="col" className="px-4 py-3 font-medium text-gray-600">Status</th>
              <th scope="col" className="px-4 py-3 font-medium text-gray-600">Payment</th>
              <th scope="col" className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Start Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <AdminEmpty
                    icon={<CalendarDays className="h-8 w-8" />}
                    message="No bookings yet."
                  />
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{b.familyName}</td>
                  <td className="px-4 py-3 text-gray-600">{b.packageName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${BOOKING_STATUS_COLORS[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYMENT_STATUS_COLORS[b.paymentStatus]}`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(b.preferredStartAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
