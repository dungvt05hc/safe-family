import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarDays, FileText, CheckCircle2 } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Badge, Button, LoadingState, Alert, Card, CardContent } from '@/components/ui'
import { fadeUpVariants } from '@/lib/motion'
import { useBooking } from '../hooks/useBookingQueries'
import {
  BOOKING_STATUS_BADGE,
  BOOKING_STATUS_LABEL,
  CHANNEL_CONFIG,
  PAYMENT_STATUS_BADGE,
  PAYMENT_STATUS_LABEL,
} from '../bookings.types'

export function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: booking, isLoading, isError } = useBooking(id)

  const backAction = (
    <Button variant="ghost" size="sm" onClick={() => navigate('/bookings/my')}>
      <ArrowLeft className="h-4 w-4" />
      All Bookings
    </Button>
  )

  if (isLoading) {
    return (
      <PageLayout title="Booking Details" action={backAction}>
        <LoadingState />
      </PageLayout>
    )
  }

  if (isError || !booking) {
    return (
      <PageLayout title="Booking Details" action={backAction}>
        <Alert variant="error">
          We couldn't load this booking. It may not exist or you may not have access.
        </Alert>
      </PageLayout>
    )
  }

  const channel = CHANNEL_CONFIG[booking.channel]
  const preferredDate = new Date(booking.preferredStartAt).toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const bookedOn = new Date(booking.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const isCompleted = booking.status === 'Completed'
  const isCancelled = booking.status === 'Cancelled'
  const isPending = booking.status === 'Pending'

  return (
    <PageLayout
      title={booking.packageName}
      description={`Booked on ${bookedOn}`}
      action={backAction}
    >
      <div className="max-w-xl space-y-6">

        {/* ── Status banner ──────────────────────────────────────────── */}
        {isCompleted && (
          <Alert variant="success">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              This session is complete. We hope it was helpful!
            </span>
          </Alert>
        )}
        {isPending && (
          <Alert variant="info">
            Your booking is awaiting confirmation. We'll reach out to you shortly.
          </Alert>
        )}

        {/* ── Summary card ───────────────────────────────────────────── */}
        <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" custom={0}>
          <Card>
            <CardContent className="space-y-4">
              {/* Channel + badges row */}
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl shrink-0">
                  {channel.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{channel.label}</p>
                  <p className="text-xs text-gray-500">{channel.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant={BOOKING_STATUS_BADGE[booking.status]} dot>
                    {BOOKING_STATUS_LABEL[booking.status]}
                  </Badge>
                  <Badge variant={PAYMENT_STATUS_BADGE[booking.paymentStatus]}>
                    {PAYMENT_STATUS_LABEL[booking.paymentStatus]}
                  </Badge>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Date/time */}
              <div className="flex items-start gap-3 text-sm text-gray-700">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <div>
                  <p className="font-medium">Preferred date &amp; time</p>
                  <p className="text-gray-500">{preferredDate}</p>
                </div>
              </div>

              {/* Notes */}
              {booking.notes && (
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <p className="font-medium">Your notes</p>
                    <p className="italic text-gray-500">"{booking.notes}"</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Actions ────────────────────────────────────────────────── */}
        {!isCancelled && !isCompleted && (
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            custom={1}
            className="flex gap-3"
          >
            <Button variant="outline" onClick={() => navigate('/bookings')}>
              Book another session
            </Button>
          </motion.div>
        )}

        {isCompleted && (
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            custom={1}
            className="flex gap-3"
          >
            <Button onClick={() => navigate('/bookings')}>Book a follow-up</Button>
            <Button variant="outline" onClick={() => navigate('/checklists')}>
              View checklist
            </Button>
          </motion.div>
        )}

      </div>
    </PageLayout>
  )
}
