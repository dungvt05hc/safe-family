import { useAdminBookings } from '../hooks/useAdminQueries'
import { useUpdateBookingStatus } from '../hooks/useAdminMutations'
import type { PaymentStatus } from '../admin.types'

const PAYMENT_STATUSES: PaymentStatus[] = ['Pending', 'Paid', 'Refunded', 'Waived']

const statusColors: Record<PaymentStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Paid: 'bg-green-100 text-green-700',
  Refunded: 'bg-blue-100 text-blue-700',
  Waived: 'bg-gray-100 text-gray-600',
}

export function AdminBookingsPage() {
  const { data, isLoading, isError } = useAdminBookings()
  const updateStatus = useUpdateBookingStatus()

  if (isLoading) return <p className="p-6 text-gray-500">Loading…</p>
  if (isError || !data) return <p className="p-6 text-red-500">Failed to load bookings.</p>

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Family</th>
              <th className="px-4 py-3 font-medium text-gray-600">Package</th>
              <th className="px-4 py-3 font-medium text-gray-600">Channel</th>
              <th className="px-4 py-3 font-medium text-gray-600">Start Date</th>
              <th className="px-4 py-3 font-medium text-gray-600">Payment Status</th>
              <th className="px-4 py-3 font-medium text-gray-600">Booked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">No bookings yet.</td>
              </tr>
            )}
            {data.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{b.familyName}</td>
                <td className="px-4 py-3 text-gray-700">{b.packageName}</td>
                <td className="px-4 py-3 text-gray-500">{b.channel}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(b.preferredStartAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={b.paymentStatus}
                    disabled={updateStatus.isPending}
                    onChange={(e) =>
                      updateStatus.mutate({ id: b.id, status: e.target.value as PaymentStatus })
                    }
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold border-0 cursor-pointer focus:ring-2 focus:ring-blue-400 ${statusColors[b.paymentStatus]}`}
                  >
                    {PAYMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
