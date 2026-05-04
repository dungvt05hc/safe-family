import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useTranslation } from 'react-i18next'
import { Alert, Button, Card, CardContent, CardHeader, CardTitle, Spinner } from '@/components/ui'
import { useInitiatePayment, useRetryPayment, useSyncPaymentStatus } from '../hooks/useBookingMutations'
import type { BookingResult, PaymentOrder } from '../bookings.types'

// ─── Countdown helper ─────────────────────────────────────────────────────────

function useCountdown(expiresAt: string | null, expiredLabel: string) {
  const [remaining, setRemaining] = useState<string | null>(null)

  useEffect(() => {
    if (!expiresAt) { setRemaining(null); return }

    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) { setRemaining(expiredLabel); return }
      const totalSec = Math.floor(diff / 1000)
      const h = Math.floor(totalSec / 3600)
      const m = Math.floor((totalSec % 3600) / 60)
      const s = totalSec % 60
      if (h > 0) setRemaining(`${h}h ${m}m`)
      else if (m > 0) setRemaining(`${m}m ${s}s`)
      else setRemaining(`${s}s`)
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt, expiredLabel])

  return remaining
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  booking: BookingResult
  paymentOrders: PaymentOrder[]
}

export function BookingPaymentPanel({ booking, paymentOrders }: Props) {
  // Free packages need no payment UI.
  if (booking.packagePrice === 0) return null

  // Terminal booking states that don't need payment UI.
  if (['Completed', 'Cancelled', 'Expired'].includes(booking.status)) return null

  const { paymentStatus } = booking
  // Latest order (most recently created).
  const latestOrder = paymentOrders.length
    ? [...paymentOrders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]
    : null

  switch (paymentStatus) {
    case 'Unpaid':
      return <UnpaidPanel booking={booking} />
    case 'Pending':
      return <PendingPanel booking={booking} latestOrder={latestOrder} />
    case 'Paid':
      return null // Handled by the booking status banner in the parent.
    case 'Failed':
      return <FailedPanel booking={booking} />
    case 'Expired':
      return <ExpiredPanel booking={booking} />
    case 'Refunded':
    case 'PartiallyRefunded':
      return <RefundedPanel paymentStatus={paymentStatus} latestOrder={latestOrder} />
    default:
      return null
  }
}

// ─── Sub-panels ───────────────────────────────────────────────────────────────

function UnpaidPanel({ booking }: { booking: BookingResult }) {
  const { t } = useTranslation('payments')
  const initiate = useInitiatePayment()

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="text-amber-800 text-base flex items-center gap-2">
          <span>💳</span> {t('panel.unpaid.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-amber-700">
          {t('panel.unpaid.amountDue')}{' '}
          <span className="font-semibold">
            {booking.packageCurrency}{' '}
            {booking.packagePrice.toLocaleString()}
          </span>
        </p>
        {initiate.isError && (
          <Alert variant="error">{t('panel.unpaid.error')}</Alert>
        )}
        <Button
          variant="primary"
          size="md"
          loading={initiate.isPending}
          onClick={() => {
            // Store the package code so PaymentCallbackPage can route to the
            // correct unlocked content page (e.g. /plans/safety vs /plans/incident-recovery).
            sessionStorage.setItem('payment_package_code', booking.packageCode)
            initiate.mutate(booking.id)
          }}
        >
          {t('panel.unpaid.payNow')}
        </Button>
      </CardContent>
    </Card>
  )
}

function PendingPanel({
  booking,
  latestOrder,
}: {
  booking: BookingResult
  latestOrder: PaymentOrder | null
}) {
  const { t } = useTranslation('payments')
  const retry = useRetryPayment()
  const sync = useSyncPaymentStatus()
  const countdown = useCountdown(latestOrder?.expiresAt ?? null, t('panel.pending.expired'))

  // Automatically sync payment status with payOS every 8 seconds.
  // This is needed because webhooks cannot reach localhost and the DB won't
  // update on its own. Each sync call queries payOS and updates the DB so the
  // booking refetch interval (10 s) can pick up the new status.
  useEffect(() => {
    const id = setInterval(() => {
      sync.mutate(booking.id)
    }, 8_000)
    return () => clearInterval(id)
  }, [booking.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800 text-base flex items-center gap-2">
          <Spinner size="sm" />
          {t('panel.pending.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {countdown && (
          <p className="text-sm text-blue-700">
            {t('panel.pending.windowClosesIn')} <span className="font-semibold">{countdown}</span>
          </p>
        )}

        {/* QR code — payOS returns a VietQR/EMVCo data string, render it with qrcode.react */}
        {latestOrder?.qrCodeUrl && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-blue-700">{t('panel.pending.scanQr')}</p>
            <div className="p-3 bg-white rounded-lg border border-blue-200 inline-block">
              <QRCodeSVG value={latestOrder.qrCodeUrl} size={192} />
            </div>
          </div>
        )}

        {/* Fallback redirect link when no QR code is available */}
        {latestOrder?.paymentUrl && !latestOrder.qrCodeUrl && (
          <a
            href={latestOrder.paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 underline"
          >
            {t('panel.pending.openPaymentPage')}
          </a>
        )}

        <p className="text-xs text-blue-600">
          {t('panel.pending.autoCheck')}
        </p>

        <Button
          variant="primary"
          size="sm"
          loading={sync.isPending}
          onClick={() => sync.mutate(booking.id)}
        >
          {t('panel.pending.checkNow')}
        </Button>

        <hr className="border-blue-200" />

        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-600">{t('panel.pending.havingTrouble')}</span>
          <Button
            variant="ghost"
            size="sm"
            loading={retry.isPending}
            onClick={() => { sessionStorage.setItem('payment_package_code', booking.packageCode); retry.mutate(booking.id) }}
          >
            {t('panel.pending.retryLink')}
          </Button>
        </div>

        {retry.isError && (
          <Alert variant="error">{t('panel.pending.retryError')}</Alert>
        )}
      </CardContent>
    </Card>
  )
}

function FailedPanel({ booking }: { booking: BookingResult }) {
  const { t } = useTranslation('payments')
  const retry = useRetryPayment()

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800 text-base flex items-center gap-2">
          <span>❌</span> {t('panel.failed.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-red-700">
          {t('panel.failed.body')}
        </p>
        {retry.isError && (
          <Alert variant="error">{t('panel.failed.error')}</Alert>
        )}
        <Button
          variant="danger"
          size="md"
          loading={retry.isPending}
          onClick={() => { sessionStorage.setItem('payment_package_code', booking.packageCode); retry.mutate(booking.id) }}
        >
          {t('panel.failed.retry')}
        </Button>
      </CardContent>
    </Card>
  )
}

function ExpiredPanel({ booking }: { booking: BookingResult }) {
  const { t } = useTranslation('payments')
  const retry = useRetryPayment()

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="text-amber-800 text-base flex items-center gap-2">
          <span>⏰</span> {t('panel.expired.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-amber-700">
          {t('panel.expired.body')}
        </p>
        {retry.isError && (
          <Alert variant="error">{t('panel.expired.error')}</Alert>
        )}
        <Button
          variant="primary"
          size="md"
          loading={retry.isPending}
          onClick={() => { sessionStorage.setItem('payment_package_code', booking.packageCode); retry.mutate(booking.id) }}
        >
          {t('panel.expired.retry')}
        </Button>
      </CardContent>
    </Card>
  )
}

function RefundedPanel({
  paymentStatus,
  latestOrder,
}: {
  paymentStatus: 'Refunded' | 'PartiallyRefunded'
  latestOrder: PaymentOrder | null
}) {
  const { t } = useTranslation('payments')
  const isPartial = paymentStatus === 'PartiallyRefunded'

  return (
    <Card className="border-sky-200 bg-sky-50">
      <CardHeader>
        <CardTitle className="text-sky-800 text-base flex items-center gap-2">
          <span>↩️</span> {isPartial ? t('panel.refunded.partialTitle') : t('panel.refunded.fullTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {latestOrder?.refundedAmount != null && (
          <p className="text-sm text-sky-700">
            {isPartial ? t('panel.refunded.refundedAmount') : t('panel.refunded.amountRefunded')}{' '}
            <span className="font-semibold">
              {latestOrder.currency} {latestOrder.refundedAmount.toLocaleString()}
            </span>
          </p>
        )}
        <p className="text-sm text-sky-700 mt-1">
          {t('panel.refunded.timeline')}
        </p>
      </CardContent>
    </Card>
  )
}
