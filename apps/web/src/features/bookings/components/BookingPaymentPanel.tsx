import { useEffect, useState } from 'react'
import { Alert, Button, Card, CardContent, CardHeader, CardTitle, Spinner } from '@/components/ui'
import { useInitiatePayment, useRetryPayment } from '../hooks/useBookingMutations'
import type { BookingResult, PaymentOrder } from '../bookings.types'

// ─── Countdown helper ─────────────────────────────────────────────────────────

function useCountdown(expiresAt: string | null) {
  const [remaining, setRemaining] = useState<string | null>(null)

  useEffect(() => {
    if (!expiresAt) { setRemaining(null); return }

    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) { setRemaining('Expired'); return }
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
  }, [expiresAt])

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
  const initiate = useInitiatePayment()

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="text-amber-800 text-base flex items-center gap-2">
          <span>💳</span> Complete payment to confirm your session
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-amber-700">
          Amount due:{' '}
          <span className="font-semibold">
            {booking.packageCurrency}{' '}
            {booking.packagePrice.toLocaleString()}
          </span>
        </p>
        {initiate.isError && (
          <Alert variant="error">Could not create a payment session. Please try again.</Alert>
        )}
        <Button
          variant="primary"
          size="md"
          loading={initiate.isPending}
          onClick={() => initiate.mutate(booking.id)}
        >
          Pay now
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
  const retry = useRetryPayment()
  const countdown = useCountdown(latestOrder?.expiresAt ?? null)

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800 text-base flex items-center gap-2">
          <Spinner size="sm" />
          Waiting for payment confirmation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {countdown && (
          <p className="text-sm text-blue-700">
            Payment window closes in: <span className="font-semibold">{countdown}</span>
          </p>
        )}

        {/* QR code (MoMo / VNPay style) */}
        {latestOrder?.qrCodeUrl && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-blue-700">Scan the QR code with your banking app:</p>
            <img
              src={latestOrder.qrCodeUrl}
              alt="Payment QR code"
              className="w-48 h-48 rounded-lg border border-blue-200"
            />
          </div>
        )}

        {/* Redirect link */}
        {latestOrder?.paymentUrl && (
          <Button
            variant="primary"
            size="md"
            onClick={() => window.open(latestOrder.paymentUrl!, '_blank', 'noopener,noreferrer')}
          >
            Open payment page ↗
          </Button>
        )}

        <p className="text-xs text-blue-600">
          This page refreshes automatically. Once payment is confirmed you'll see an update here.
        </p>

        <hr className="border-blue-200" />

        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-600">Having trouble?</span>
          <Button
            variant="ghost"
            size="sm"
            loading={retry.isPending}
            onClick={() => retry.mutate(booking.id)}
          >
            Retry with a new link
          </Button>
        </div>

        {retry.isError && (
          <Alert variant="error">Could not create a new payment link. Please try again.</Alert>
        )}
      </CardContent>
    </Card>
  )
}

function FailedPanel({ booking }: { booking: BookingResult }) {
  const retry = useRetryPayment()

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800 text-base flex items-center gap-2">
          <span>❌</span> Payment could not be processed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-red-700">
          Your payment was declined or cancelled. You can try again with the same or a different
          payment method.
        </p>
        {retry.isError && (
          <Alert variant="error">Could not create a new payment session. Please try again.</Alert>
        )}
        <Button
          variant="danger"
          size="md"
          loading={retry.isPending}
          onClick={() => retry.mutate(booking.id)}
        >
          Try again
        </Button>
      </CardContent>
    </Card>
  )
}

function ExpiredPanel({ booking }: { booking: BookingResult }) {
  const retry = useRetryPayment()

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="text-amber-800 text-base flex items-center gap-2">
          <span>⏰</span> Payment window expired
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-amber-700">
          The payment session timed out. Start a new payment to finalise your booking.
        </p>
        {retry.isError && (
          <Alert variant="error">Could not create a new payment session. Please try again.</Alert>
        )}
        <Button
          variant="primary"
          size="md"
          loading={retry.isPending}
          onClick={() => retry.mutate(booking.id)}
        >
          Retry payment
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
  const isPartial = paymentStatus === 'PartiallyRefunded'

  return (
    <Card className="border-sky-200 bg-sky-50">
      <CardHeader>
        <CardTitle className="text-sky-800 text-base flex items-center gap-2">
          <span>↩️</span> {isPartial ? 'Partial refund issued' : 'Refund issued'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {latestOrder?.refundedAmount != null && (
          <p className="text-sm text-sky-700">
            {isPartial ? 'Refunded amount' : 'Amount refunded'}:{' '}
            <span className="font-semibold">
              {latestOrder.currency} {latestOrder.refundedAmount.toLocaleString()}
            </span>
          </p>
        )}
        <p className="text-sm text-sky-700 mt-1">
          Refunds typically appear within 3–5 business days.
        </p>
      </CardContent>
    </Card>
  )
}
