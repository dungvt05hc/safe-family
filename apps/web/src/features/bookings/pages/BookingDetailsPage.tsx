import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  ArrowLeft, CalendarDays, FileText, Clock, CheckCircle2,
  CreditCard, User, Download, ShieldCheck, Tag, AlertTriangle,
  Smartphone, LayoutList, PackageCheck,
} from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Badge, Button, LoadingState, Alert, Card, CardContent } from '@/components/ui'
import { fadeUpVariants } from '@/lib/motion'
import { useBooking, usePaymentOrders, useBookingEvents } from '../hooks/useBookingQueries'
import {
  BOOKING_STATUS_BADGE,
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_CONTEXT,
  PAYMENT_STATUS_BADGE,
  PAYMENT_STATUS_LABEL,
} from '../bookings.types'
import { BookingPaymentPanel } from '../components/BookingPaymentPanel'

// ── Event timeline config ─────────────────────────────────────────────────────

const HIDDEN_EVENT_TYPES = new Set([
  'note.added', 'admin.assigned', 'report.linked',
  'booking.status_changed', 'payment.status_changed',
])

// EVENT_DISPLAY labels, URGENCY_LABEL, and DELIVERY_STATUS_BADGE are built
// inside the component so their text values pass through useTranslation('payments').

// ─── Status bar config ────────────────────────────────────────────────────────

const STATUS_ICON: Partial<Record<string, React.ReactNode>> = {
  Submitted:  <CreditCard className="h-5 w-5 text-amber-500" />,
  Paid:       <CreditCard className="h-5 w-5 text-blue-500" />,
  Confirmed:  <CheckCircle2 className="h-5 w-5 text-indigo-500" />,
  Scheduled:  <CalendarDays className="h-5 w-5 text-purple-500" />,
  InProgress: <ShieldCheck className="h-5 w-5 text-orange-500" />,
  Completed:  <CheckCircle2 className="h-5 w-5 text-green-500" />,
}

const URGENCY_LABEL: Record<string, string> = {
  Routine:  'No rush',
  Urgent:   'Needs attention',
  Critical: 'Active issue — urgent',
}

const DELIVERY_STATUS_BADGE: Record<string, { label: string; className: string }> = {
  Pending:    { label: 'Awaiting Confirmation', className: 'text-gray-500  bg-gray-50   border border-gray-200' },
  Processing: { label: 'Being Prepared',        className: 'text-blue-700  bg-blue-50   border border-blue-200' },
  Delivered:  { label: 'Delivered',             className: 'text-green-700 bg-green-50  border border-green-200' },
  Failed:     { label: 'Delivery Failed',       className: 'text-red-700   bg-red-50    border border-red-200' },
}

// ─────────────────────────────────────────────────────────────────────────────

export function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation('payments')

  // ── Computed locale-aware maps (depend on t()) ────────────────────────────
  const EVENT_LABELS: Record<string, string> = {
    'booking.created':       t('details.events.bookingCreated'),
    'booking.submitted':     t('details.events.bookingSubmitted'),
    'payment.initiated':     t('details.events.paymentInitiated'),
    'payment.retried':       t('details.events.paymentRetried'),
    'payment.received':      t('details.events.paymentReceived'),
    'booking.paid':          t('details.events.bookingPaid'),
    'payment.failed':        t('details.events.paymentFailed'),
    'payment.expired':       t('details.events.paymentExpired'),
    'booking.confirmed':     t('details.events.bookingConfirmed'),
    'booking.scheduled':     t('details.events.bookingScheduled'),
    'booking.in_progress':   t('details.events.bookingInProgress'),
    'booking.completed':     t('details.events.bookingCompleted'),
    'booking.cancelled':     t('details.events.bookingCancelled'),
    'booking.expired':       t('details.events.bookingExpired'),
    'fulfillment.triggered': t('details.events.fulfillmentTriggered'),
    'fulfillment.delivered': t('details.events.fulfillmentDelivered'),
  }

  const URGENCY_LABELS: Record<string, string> = {
    Routine:  t('details.urgency.Routine'),
    Urgent:   t('details.urgency.Urgent'),
    Critical: t('details.urgency.Critical'),
  }

  const DELIVERY_STATUS_LABELS: Record<string, string> = {
    Pending:    t('details.deliveryStatus.Pending'),
    Processing: t('details.deliveryStatus.Processing'),
    Delivered:  t('details.deliveryStatus.Delivered'),
    Failed:     t('details.deliveryStatus.Failed'),
  }

  const { data: booking, isLoading, isError } = useBooking(id)
  const { data: paymentOrders = [] } = usePaymentOrders(
    booking?.packagePrice !== 0 ? id : undefined,
  )
  const { data: events = [] } = useBookingEvents(id)

  const backAction = (
    <Button variant="ghost" size="sm" onClick={() => navigate('/bookings/my')}>
      <ArrowLeft className="h-4 w-4" />
      {t('details.backButton')}
    </Button>
  )

  if (isLoading) {
    return (
      <PageLayout title={t('details.pageTitle')} action={backAction}>
        <LoadingState />
      </PageLayout>
    )
  }

  if (isError || !booking) {
    return (
      <PageLayout title={t('details.pageTitle')} action={backAction}>
        <Alert variant="error">
          {t('details.loadError')}
        </Alert>
      </PageLayout>
    )
  }

  const bookedOn = new Date(booking.createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  const isFree      = booking.packagePrice === 0
  const isCompleted = booking.status === 'Completed'
  const isCancelled = booking.status === 'Cancelled'
  const isPreparing = booking.status === 'Paid' || booking.status === 'Confirmed'
  const statusCtx   = BOOKING_STATUS_CONTEXT[booking.status]
  const statusIcon  = STATUS_ICON[booking.status]

  // Paid payment order for the receipt row
  const paidOrder = paymentOrders.find((o) => o.status === 'Paid')

  return (
    <PageLayout
      title={booking.packageName}
      description={t('details.bookedOn', { date: bookedOn })}
      action={backAction}
    >
      <div className="max-w-xl space-y-5">

        {/* ── Hero status card ───────────────────────────────────────── */}
        <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" custom={0}>
          <Card>
            <CardContent className="space-y-4">

              {/* Status header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {statusIcon ?? (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                      <ShieldCheck className="h-5 w-5 text-blue-400" />
                    </span>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 leading-tight">{booking.packageName}</p>
                    {statusCtx && (
                      <p className="text-xs text-gray-500 mt-0.5">{statusCtx}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge variant={BOOKING_STATUS_BADGE[booking.status]} dot>
                    {BOOKING_STATUS_LABEL[booking.status]}
                  </Badge>
                  {!isFree && (
                    <Badge variant={PAYMENT_STATUS_BADGE[booking.paymentStatus]}>
                      {PAYMENT_STATUS_LABEL[booking.paymentStatus]}
                    </Badge>
                  )}
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">

                {/* Help topic */}
                {booking.helpTopic && (
                  <div className="col-span-2 flex items-start gap-2 text-gray-600">
                    <Tag className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">{t('details.fields.helpTopic')}</p>
                      <p className="font-medium text-gray-800">{booking.helpTopic}</p>
                    </div>
                  </div>
                )}

                {/* Urgency */}
                {booking.urgency && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-gray-400" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">{t('details.fields.urgency')}</p>
                      <p className="font-medium text-gray-800">
                        {URGENCY_LABELS[booking.urgency] ?? booking.urgency}
                      </p>
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2 text-gray-600">
                  <CreditCard className="h-4 w-4 shrink-0 text-gray-400" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">{t('details.fields.price')}</p>
                    <p className="font-medium text-gray-800">
                      {isFree
                        ? t('details.fields.free')
                        : `${booking.packageCurrency} ${booking.packagePrice.toLocaleString()}`}
                    </p>
                  </div>
                </div>

                {/* Ordered on */}
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4 shrink-0 text-gray-400" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">{t('details.fields.ordered')}</p>
                    <p className="font-medium text-gray-800">{bookedOn}</p>
                  </div>
                </div>

                {/* Delivery status */}
                {(() => {
                  const ds = DELIVERY_STATUS_BADGE[booking.deliveryStatus]
                  return ds ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <PackageCheck className="h-4 w-4 shrink-0 text-gray-400" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">{t('details.fields.materials')}</p>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ds.className}`}>
                          {DELIVERY_STATUS_LABELS[booking.deliveryStatus] ?? ds.label}
                        </span>
                      </div>
                    </div>
                  ) : null
                })()}

                {/* Affected device / account */}
                {booking.affectedTarget && (
                  <div className="col-span-2 flex items-center gap-2 text-gray-600">
                    <Smartphone className="h-4 w-4 shrink-0 text-gray-400" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">{t('details.fields.affectedTarget')}</p>
                      <p className="font-medium text-gray-800">{booking.affectedTarget}</p>
                    </div>
                  </div>
                )}

                {/* Assigned advisor */}
                {booking.assignedAdminEmail && (
                  <div className="col-span-2 flex items-center gap-2 text-gray-600">
                    <User className="h-4 w-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">{t('details.fields.advisor')}</p>
                      <p className="font-medium text-gray-800">{booking.assignedAdminEmail}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer notes */}
              {booking.customerNotes && (
                <>
                  <hr className="border-gray-100" />
                  <div className="flex items-start gap-2 text-sm">
                    <FileText className="mt-0.5 h-4 w-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">{t('details.fields.notes')}</p>
                      <p className="text-gray-700 italic">"{booking.customerNotes}"</p>
                    </div>
                  </div>
                </>
              )}

              {/* Payment receipt row — shown only when paid */}
              {paidOrder && (
                <>
                  <hr className="border-gray-100" />
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400">{t('details.fields.payment')}</p>
                      <p className="font-medium text-green-700">
                        {t('details.fields.paid', { amount: `${paidOrder.currency} ${paidOrder.amount.toLocaleString()}` })}
                        {paidOrder.paidAt && (
                          <span className="text-gray-400 font-normal">
                            {' · '}
                            {new Date(paidOrder.paidAt).toLocaleDateString(undefined, {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })}
                          </span>
                        )}
                      </p>
                    </div>
                    {paidOrder.gatewayProvider && (
                      <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">
                        {paidOrder.gatewayProvider}
                      </span>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Payment action panel ───────────────────────────────────── */}
        <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" custom={1}>
          <BookingPaymentPanel booking={booking} paymentOrders={paymentOrders} />
        </motion.div>

        {/* ── Materials being prepared banner ───────────────────────── */}
        {isPreparing && !booking.primaryReport && (
          <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" custom={2}>
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                <div>
                  <p className="font-semibold text-blue-800">{t('details.preparing.title')}</p>
                  <p className="mt-0.5 text-sm text-blue-600">
                    {t('details.preparing.body')}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate('/reports')}>
                      <FileText className="h-3.5 w-3.5" />
                      {t('details.preparing.checkReports')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate('/checklists')}>
                      <LayoutList className="h-3.5 w-3.5" />
                      {t('details.preparing.viewChecklist')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Linked report card ─────────────────────────────────────── */}
        {booking.primaryReport && (
          <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" custom={2}>
            <Card>
              <CardContent>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 shrink-0">
                    <FileText className="h-4 w-4 text-amber-500" />
                  </span>
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
                    {booking.primaryReport.fileUrl && (
                      <a
                        href={booking.primaryReport.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-amber-600 hover:text-amber-700 hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {t('details.report.download')}
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Activity timeline ──────────────────────────────────────── */}
        {(() => {
          const visible = events.filter((e) => !HIDDEN_EVENT_TYPES.has(e.eventType))
          if (visible.length === 0) return null
          return (
            <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" custom={3}>
              <Card>
                <CardContent>
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {t('details.timeline.title')}
                  </h2>
                  <ol className="relative border-l-2 border-gray-100 space-y-5 ml-2">
                    {visible.map((event, i) => {
                      const eventStyles: Record<string, { bg: string }> = {
                        'booking.created':       { bg: 'bg-blue-500' },
                        'booking.submitted':     { bg: 'bg-blue-500' },
                        'payment.initiated':     { bg: 'bg-yellow-500' },
                        'payment.retried':       { bg: 'bg-yellow-500' },
                        'payment.received':      { bg: 'bg-green-500' },
                        'booking.paid':          { bg: 'bg-green-500' },
                        'payment.failed':        { bg: 'bg-red-500' },
                        'payment.expired':       { bg: 'bg-gray-400' },
                        'booking.confirmed':     { bg: 'bg-indigo-500' },
                        'booking.scheduled':     { bg: 'bg-purple-500' },
                        'booking.in_progress':   { bg: 'bg-orange-500' },
                        'booking.completed':     { bg: 'bg-green-600' },
                        'booking.cancelled':     { bg: 'bg-red-500' },
                        'booking.expired':       { bg: 'bg-gray-400' },
                        'fulfillment.triggered': { bg: 'bg-indigo-500' },
                        'fulfillment.delivered': { bg: 'bg-green-600' },
                      }
                      const label  = EVENT_LABELS[event.eventType] ?? event.eventType
                      const dotBg  = eventStyles[event.eventType]?.bg ?? 'bg-gray-400'
                      const isLast = i === visible.length - 1
                      return (
                        <li key={event.id} className="ml-5">
                          <span
                            className={`absolute -left-[9px] mt-0.5 h-4 w-4 rounded-full border-2 border-white ${dotBg} shadow-sm`}
                            aria-hidden="true"
                          />
                          <div className="flex items-baseline justify-between gap-2">
                            <p className={`text-sm font-medium ${isLast ? 'text-gray-900' : 'text-gray-600'}`}>
                              {label}
                            </p>
                            <time
                              dateTime={event.createdAt}
                              className="shrink-0 text-xs text-gray-400 tabular-nums"
                            >
                              {new Date(event.createdAt).toLocaleString(undefined, {
                                month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </time>
                          </div>
                          {event.description && (
                            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                              {event.description}
                            </p>
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
        {!isCancelled && (
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            <div className="flex flex-wrap gap-3">
              {(isPreparing || isCompleted) && (
                <>
                  <Button variant="outline" onClick={() => navigate('/reports')}>
                    <FileText className="h-4 w-4" />
                    {t('details.actions.viewReports')}
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/checklists')}>
                    <LayoutList className="h-4 w-4" />
                    {t('details.actions.viewChecklist')}
                  </Button>
                </>
              )}
              <Button variant="ghost" onClick={() => navigate('/bookings')}>
                {t('details.actions.anotherProduct')}
              </Button>
            </div>
          </motion.div>
        )}

      </div>
    </PageLayout>
  )
}
