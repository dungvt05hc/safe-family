import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSyncPaymentStatus } from '../hooks/useBookingMutations'
import { queryClient } from '@/lib/queryClient'
import { ENTITLEMENTS_KEY } from '@/features/entitlements/hooks/useMyEntitlements'

const PAID_CONTENT_URLS: Record<string, string> = {
  'FAMILY-CORE':   '/plans/safety',
  'INCIDENT-RESP': '/plans/incident-recovery',
  'ANNUAL-PLAN':   '/plans/safety',
}

/**
 * Handles the return redirect from the payment gateway (payOS ReturnUrl / CancelUrl).
 *
 * payOS redirects to this page after the user completes or cancels payment, with
 * query params:  ?orderCode=...&status=PAID|CANCELLED&id=...&cancel=true|false
 *
 * The component:
 *   1. Reads the bookingId stored in sessionStorage when payment was initiated.
 *   2. Calls POST /api/bookings/{id}/payment/sync to pull the latest status from payOS.
 *   3. Navigates to the booking details page once sync is done (or after a short timeout).
 */
export function PaymentCallbackPage() {
  const navigate        = useNavigate()
  const [searchParams]  = useSearchParams()
  const { t }           = useTranslation('payments')
  const syncMutation    = useSyncPaymentStatus()
  const syncCalledRef   = useRef(false)

  useEffect(() => {
    if (syncCalledRef.current) return
    syncCalledRef.current = true

    const bookingId = sessionStorage.getItem('payment_booking_id')

    const redirectAfter = (id: string, paid: boolean) => {
      const packageCode = sessionStorage.getItem('payment_package_code') ?? ''
      sessionStorage.removeItem('payment_booking_id')
      sessionStorage.removeItem('payment_package_code')
      if (paid) {
        queryClient.invalidateQueries({ queryKey: ENTITLEMENTS_KEY })
        const dest = PAID_CONTENT_URLS[packageCode] ?? `/bookings/${id}/unlocked`
        navigate(dest, { replace: true })
      } else {
        navigate(`/bookings/${id}`, { replace: true })
      }
    }

    const redirectFallback = () => {
      sessionStorage.removeItem('payment_booking_id')
      navigate('/bookings/my', { replace: true })
    }

    if (!bookingId) {
      redirectFallback()
      return
    }

    // Sync status with gateway, then route based on the confirmed payment state.
    syncMutation.mutate(bookingId, {
      onSuccess: (data) => redirectAfter(bookingId, data.paymentStatus === 'Paid'),
      onError:   ()     => redirectAfter(bookingId, false),
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const status = searchParams.get('status')
  const isCancelled = searchParams.get('cancel') === 'true'

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">
          {isCancelled
            ? t('callback.cancelled')
            : status === 'PAID'
            ? t('callback.received')
            : t('callback.verifying')}
        </p>
      </div>
    </div>
  )
}
