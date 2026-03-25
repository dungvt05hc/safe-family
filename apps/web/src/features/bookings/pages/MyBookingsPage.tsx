import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { NoBookingsEmpty } from '@/components/ui/entity-empty-states'
import { useMyBookings } from '../hooks/useBookingQueries'
import { CHANNEL_CONFIG, PAYMENT_STATUS_CONFIG } from '../bookings.types'

export function MyBookingsPage() {
  const navigate = useNavigate()
  const { data: bookings, isLoading, isError } = useMyBookings()

  return (
    <PageLayout
      title="My Bookings"
      description="Your upcoming and past safety sessions."
      action={
        <button
          onClick={() => navigate('/bookings')}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Book a Session
        </button>
      }
    >
      {isLoading && <p className="text-sm text-gray-500">Loading bookings…</p>}

      {isError && (
        <p className="text-sm text-red-600">Failed to load bookings. Please try again.</p>
      )}

      {!isLoading && !isError && (!bookings || bookings.length === 0) && (
        <NoBookingsEmpty onBook={() => navigate('/bookings')} />
      )}

      {bookings && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const channelConfig = CHANNEL_CONFIG[booking.channel]
            const statusConfig = PAYMENT_STATUS_CONFIG[booking.paymentStatus]
            const preferredDate = new Date(booking.preferredStartAt).toLocaleString()

            return (
              <div
                key={booking.id}
                className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900">{booking.packageName}</h3>
                  <p className="text-sm text-gray-500">
                    {channelConfig.icon} {channelConfig.label}
                  </p>
                  <p className="text-sm text-gray-500">🗓 {preferredDate}</p>
                  {booking.notes && (
                    <p className="text-sm italic text-gray-400">"{booking.notes}"</p>
                  )}
                </div>
                <span
                  className={`inline-block self-start rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.color}`}
                >
                  {statusConfig.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </PageLayout>
  )
}
