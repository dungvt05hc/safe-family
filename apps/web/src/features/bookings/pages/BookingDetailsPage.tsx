import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarDays, FileText, CheckCircle2, Clock } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Badge, Button, LoadingState, Alert, Card, CardContent } from '@/components/ui'
import { fadeUpVariants } from '@/lib/motion'
import { useBooking, usePaymentOrders, useBookingEvents } from '../hooks/useBookingQueries'
import {
  BOOKING_STATUS_BADGE,
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_CONTEXT,
  CHANNEL_CONFIG,
  PAYMENT_STATUS_BADGE,
  PAYMENT_STATUS_LABEL,
} from '../bookings.types'
import { BookingPaymentPanel } from '../components/BookingPaymentPanel'

// ── Event timeline config ─────────────────────────────────────────────────────

const HIDDEN_EVENT_TYPES = new Set([
  'note.added', 'admin.assigned', 'report.linked',
  'booking.status_changed', 'payment.status_changed',
])

const EVENT_DISPLAY: Record<string, { label: string; dot: string }> = {
  'booking.created':     { label: 'Booking Created',     dot: 'bg-blue-500' },
  'booking.submitted':   { label: 'Booking Submitted',   dot: 'bg-blue-500' },
  'payment.initiated':   { label: 'Payment Initiated',   dot: 'bg-yellow-500' },
  'payment.retried':     { label: 'Payment Retried',     dot: 'bg-yellow-500' },
  'payment.received':    { label: 'Payment Received',    dot: 'bg-green-500' },
  'booking.paid':        { label: 'Payment Confirmed',   dot: 'bg-green-500' },
  'payment.failed':      { label: 'Payment Failed',      dot: 'bg-red-500' },
  'payment.expired':     { label: 'Payment Expired',     dot: 'bg-gray-400' },
  'booking.confirmed':   { label: 'Booking Confirmed',   dot: 'bg-green-500' },
  'booking.scheduled':   { label: 'Session Scheduled',   dot: 'bg-indigo-500' },
  'booking.in_progress': { label: 'Session In Progress', dot: 'bg-orange-500' },
  'booking.completed':   { label: 'Session Completed',   dot: 'bg-green-600' },
  'booking.cancelled':   { label: 'Booking Cancelled',   dot: 'bg-red-500' },
  'booking.expired':     { label: 'Booking Expired',     dot: 'bg-gray-400' },
}

// ─────────────────────────────────────────────────────────────────────────────

export function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: booking, isLoading, isError } = useBooking(id)
  const { data: paymentOrders = [] } = usePaymentOrders(
    booking?.packagePrice !== 0 ? id : undefined,
  )
  const { data: events = [] } = useBookingEvents(id)

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
  const statusContext = BOOKING_STATUS_CONTEXT[booking.status]

  return (
    <PageLayout
      title={booking.packageName}
      description={`Booked on ${bookedOn}`}
      action={backAction}
    >
      <div className="max-w-xl space-y-6">

        {/* ── Status banner ──────────────────────────────────────────── */}
        {booking.status === 'Completed' && (
          <Alert variant="success">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {statusContext}
            </span>
          </Alert>
        )}
        {booking.status === 'Paid' && (
          <Alert variant="info">{statusContext}</Alert>
        )}
        {(booking.status === 'Confirmed' || booking.status === 'Scheduled') && (
          <Alert variant="success">{statusContext}</Alert>
        )}
        {booking.status === 'InProgress' && (
          <Alert variant="info">{statusContext}</Alert>
        )}
        {(booking.status === 'Cancelled' || booking.status === 'Expired') && (
          <Alert variant="warning">{statusContext}</Alert>
        )}

        {/* ── Payment panel ──────────────────────────────────────────── */}
        <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" custom={0}>
          <BookingPaymentPanel booking={booking} paymentOrders={paymentOrders} />
        </motion.div>

        {/* ── Summary card ───────────────────────────────────────────── */}
        <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" custom={1}>
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
              {booking.customerNotes && (
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <p className="font-medium">Your notes</p>
                    <p className="italic text-gray-500">"{booking.customerNotes}"</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Linked report card ─────────────────────────────────────── */}
        {booking.primaryReport && (
          <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" custom={2}>
            <Card>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{booking.primaryReport.title}</p>
                    {booking.primaryReport.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{booking.primaryReport.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {booking.primaryReport.reportType} &middot;{' '}
                      {new Date(booking.primaryReport.generatedAt).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                {booking.primaryReport.fileUrl && (
                  <a
                    href={booking.primaryReport.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 hover:underline"
                  >
                    Download Report
                  </a>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Event timeline ─────────────────────────────────────────── */}
        {(() => {
          const visible = events.filter((e) => !HIDDEN_EVENT_TYPES.has(e.eventType))
          if (visible.length === 0) return null
          return (
            <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" custom={3}>
              <Card>
                <CardContent>
                  <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    Activity
                  </h2>
                  <ol className="relative border-l border-gray-200 space-y-5 ml-2">
                    {visible.map((event, i) => {
                      const cfg = EVENT_DISPLAY[event.eventType]
                      const label = cfg?.label ?? event.eventType
                      const dot = cfg?.dot ?? 'bg-gray-400'
                      const isLast = i === visible.length - 1
                      return (
                        <li key={event.id} className="ml-4">
                          <span
                            className={`absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-white ${dot}`}
                            aria-hidden="true"
                          />
                          <div className="flex items-baseline justify-between gap-3">
                            <p className={`text-sm font-medium ${isLast ? 'text-gray-900' : 'text-gray-600'}`}>
                              {label}
                            </p>
                            <time
                              dateTime={event.createdAt}
                              className="shrink-0 text-xs text-gray-400"
                            >
                              {new Date(event.createdAt).toLocaleString(undefined, {
                                month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </time>
                          </div>
                          {event.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                          )}
                        </li>
                      )
                    })}
                  </ol>
                </CardContent>
              </Card>
            </motion.div>
          )
        })()}

        {/* ── Actions ────────────────────────────────────────────────── */}
        {!isCancelled && !isCompleted && (
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            custom={4}
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
            custom={4}
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
