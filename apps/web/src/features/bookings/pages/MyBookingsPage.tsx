import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarDays, ChevronRight, Clock, CreditCard, PlusCircle, RotateCcw } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Badge, Button, LoadingState, Alert, Spinner } from '@/components/ui'
import { NoBookingsEmpty } from '@/components/ui/entity-empty-states'
import { fadeUpVariants } from '@/lib/motion'
import { useMyBookings } from '../hooks/useBookingQueries'
import { useInitiatePayment, useRetryPayment } from '../hooks/useBookingMutations'
import {
  BOOKING_SOURCE_CONFIG,
  BOOKING_STATUS_BADGE,
  BOOKING_STATUS_LABEL,
  CHANNEL_CONFIG,
  PAYMENT_STATUS_BADGE,
  PAYMENT_STATUS_LABEL,
  type BookingResult,
} from '../bookings.types'

// ─── Payment action strip ─────────────────────────────────────────────────────

function PaymentActionStrip({ booking }: { booking: BookingResult }) {
  const initiate = useInitiatePayment()
  const retry = useRetryPayment()

  const isTerminal = ['Completed', 'Cancelled', 'Expired'].includes(booking.status)
  if (isTerminal || booking.packagePrice === 0) return null

  if (booking.paymentStatus === 'Unpaid') {
    return (
      <div className="flex items-center gap-3 border-t border-amber-100 bg-amber-50 px-5 py-3">
        <CreditCard className="h-4 w-4 shrink-0 text-amber-600" />
        <p className="flex-1 text-xs text-amber-700">Payment required to confirm your booking</p>
        {initiate.isError && (
          <span className="text-xs text-red-500">Failed — try again</span>
        )}
        <Button
          size="sm"
          variant="primary"
          loading={initiate.isPending}
          onClick={(e) => { e.stopPropagation(); initiate.mutate(booking.id) }}
        >
          Pay now
        </Button>
      </div>
    )
  }

  if (booking.paymentStatus === 'Pending') {
    return (
      <div className="flex items-center gap-3 border-t border-blue-100 bg-blue-50 px-5 py-3">
        <Spinner size="sm" />
        <p className="flex-1 text-xs text-blue-700">Waiting for payment confirmation</p>
      </div>
    )
  }

  if (booking.paymentStatus === 'Failed' || booking.paymentStatus === 'Expired') {
    const isFailed = booking.paymentStatus === 'Failed'
    return (
      <div className="flex items-center gap-3 border-t border-red-100 bg-red-50 px-5 py-3">
        <RotateCcw className="h-4 w-4 shrink-0 text-red-500" />
        <p className="flex-1 text-xs text-red-700">
          {isFailed
            ? 'Payment was declined — you can try again'
            : 'Payment window expired — start a new session'}
        </p>
        {retry.isError && (
          <span className="text-xs text-red-500">Failed — try again</span>
        )}
        <Button
          size="sm"
          variant="danger"
          loading={retry.isPending}
          onClick={(e) => { e.stopPropagation(); retry.mutate(booking.id) }}
        >
          Retry
        </Button>
      </div>
    )
  }

  return null
}

// ─── Single booking row ───────────────────────────────────────────────────────

function BookingRow({ booking, index }: { booking: BookingResult; index: number }) {
  const navigate = useNavigate()
  const channel = CHANNEL_CONFIG[booking.channel]
  const source = BOOKING_SOURCE_CONFIG[booking.source]

  const preferredDate = new Date(booking.preferredStartAt).toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const priceLabel =
    booking.packagePrice === 0
      ? 'Free'
      : `${booking.packageCurrency} ${booking.packagePrice.toLocaleString()}`

  const durationLabel =
    booking.packageDurationMinutes >= 60
      ? `${booking.packageDurationMinutes / 60}h`
      : `${booking.packageDurationMinutes}m`

  return (
    <motion.div
      custom={index}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
    >
      {/* Clickable main area */}
      <button
        className="flex w-full items-start gap-4 px-5 py-4 text-left"
        onClick={() => navigate(`/bookings/${booking.id}`)}
      >
        {/* Channel icon */}
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
          {channel.icon}
        </span>

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Package name + source tag */}
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-gray-900 leading-snug">{booking.packageName}</p>
            {source && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                {source.icon} {source.label}
              </span>
            )}
          </div>

          {/* Package snapshot */}
          <p className="text-xs text-gray-400 flex items-center gap-2">
            <span>{booking.packageCode}</span>
            <span>·</span>
            <Clock className="h-3 w-3 shrink-0" />
            <span>{durationLabel}</span>
            <span>·</span>
            <span>{priceLabel}</span>
          </p>

          {/* Preferred date + channel */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              {preferredDate}
            </span>
            <span>{channel.label}</span>
          </div>

          {/* Notes */}
          {booking.customerNotes && (
            <p className="truncate text-xs italic text-gray-400">"{booking.customerNotes}"</p>
          )}
        </div>

        {/* Status badges + chevron */}
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge variant={BOOKING_STATUS_BADGE[booking.status]} dot>
            {BOOKING_STATUS_LABEL[booking.status]}
          </Badge>
          <Badge variant={PAYMENT_STATUS_BADGE[booking.paymentStatus]}>
            {PAYMENT_STATUS_LABEL[booking.paymentStatus]}
          </Badge>
          <ChevronRight className="mt-1 h-4 w-4 text-gray-400" />
        </div>
      </button>

      {/* Conditional payment action strip */}
      <PaymentActionStrip booking={booking} />
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
          {bookings.map((booking, i) => (
            <BookingRow key={booking.id} booking={booking} index={i} />
          ))}
        </div>
      )}
    </PageLayout>
  )
}

