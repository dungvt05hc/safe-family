import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarDays, ChevronRight, PlusCircle } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Badge, Button, LoadingState, Alert } from '@/components/ui'
import { NoBookingsEmpty } from '@/components/ui/entity-empty-states'
import { fadeUpVariants } from '@/lib/motion'
import { useMyBookings } from '../hooks/useBookingQueries'
import {
  BOOKING_STATUS_BADGE,
  BOOKING_STATUS_LABEL,
  CHANNEL_CONFIG,
  PAYMENT_STATUS_BADGE,
  PAYMENT_STATUS_LABEL,
} from '../bookings.types'

export function MyBookingsPage() {
  const navigate = useNavigate()
  const { data: bookings, isLoading, isError } = useMyBookings()

  return (
    <PageLayout
      title="My Bookings"
      description="Your upcoming and past safety sessions."
      action={
        <Button size="sm" onClick={() => navigate('/bookings')}>
          <PlusCircle className="h-4 w-4" />
          Book a Session
        </Button>
      }
    >
      {isLoading && <LoadingState />}

      {isError && (
        <Alert variant="error">Failed to load bookings. Please refresh and try again.</Alert>
      )}

      {!isLoading && !isError && (!bookings || bookings.length === 0) && (
        <NoBookingsEmpty onBook={() => navigate('/bookings')} />
      )}

      {bookings && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((booking, i) => {
            const channel = CHANNEL_CONFIG[booking.channel]
            const preferredDate = new Date(booking.preferredStartAt).toLocaleString(undefined, {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <motion.button
                key={booking.id}
                custom={i}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                onClick={() => navigate(`/bookings/${booking.id}`)}
                className="flex w-full items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition hover:shadow-md text-left"
              >
                {/* Icon */}
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
                  {channel.icon}
                </span>

                {/* Main content */}
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate font-semibold text-gray-900">{booking.packageName}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      {preferredDate}
                    </span>
                    <span>{channel.label}</span>
                  </div>
                  {booking.notes && (
                    <p className="truncate text-xs italic text-gray-400">"{booking.notes}"</p>
                  )}
                </div>

                {/* Badges */}
                <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
                  <Badge variant={BOOKING_STATUS_BADGE[booking.status]} dot>
                    {BOOKING_STATUS_LABEL[booking.status]}
                  </Badge>
                  <Badge variant={PAYMENT_STATUS_BADGE[booking.paymentStatus]}>
                    {PAYMENT_STATUS_LABEL[booking.paymentStatus]}
                  </Badge>
                </div>

                <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
              </motion.button>
            )
          })}
        </div>
      )}
    </PageLayout>
  )
}

