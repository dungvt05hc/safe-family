import type { BadgeVariant } from '@/components/ui'

// ─── Enums / union types ──────────────────────────────────────────────────────

export type BookingChannel = 'Online' | 'Phone' | 'Email' | 'Onsite'

export type BookingSource = 'Direct' | 'IncidentFollowUp' | 'AssessmentFollowUp' | 'AdminCreated'

/**
 * Mirrors the backend BookingStatus enum (string-serialised).
 * Draft → Submitted → Paid → Confirmed → Scheduled → InProgress → Completed
 *                   ↘ Cancelled / Expired (any non-terminal)
 */
export type BookingStatus =
  | 'Draft'
  | 'Submitted'
  | 'Paid'
  | 'Confirmed'
  | 'Scheduled'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled'
  | 'Expired'

/**
 * Mirrors the backend PaymentStatus enum (string-serialised).
 * Unpaid → Pending → Paid → Refunded / PartiallyRefunded
 *                  ↘ Failed / Expired
 */
export type PaymentStatus =
  | 'Unpaid'
  | 'Pending'
  | 'Paid'
  | 'Failed'
  | 'Expired'
  | 'Refunded'
  | 'PartiallyRefunded'

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface ServicePackage {
  id: string
  name: string
  description: string
  priceDisplay: string
  durationLabel: string
}

export interface CreateBookingRequest {
  packageId: string
  preferredStartAt: string
  channel: BookingChannel
  notes?: string
  source?: BookingSource
  sourceIncidentId?: string
  sourceAssessmentId?: string
}

/** Matches the backend BookingResponse DTO (camelCase from System.Text.Json). */
export interface BookingResult {
  id: string
  familyId: string
  packageId: string
  packageName: string
  packageCode: string
  packagePrice: number
  packageCurrency: string
  packageDurationMinutes: number
  preferredStartAt: string
  scheduledStartAt: string | null
  scheduledEndAt: string | null
  channel: BookingChannel
  source: BookingSource
  sourceIncidentId: string | null
  sourceAssessmentId: string | null
  notes: string | null
  status: BookingStatus
  paymentStatus: PaymentStatus
  /** UTC deadline for the current payment session. Null when not in Pending state. */
  expiresAt: string | null
  assignedAdminId: string | null
  assignedAdminEmail: string | null
  createdAt: string
  updatedAt: string
}

/** Matches the backend PaymentOrderResponse DTO. */
export interface PaymentOrder {
  id: string
  bookingId: string
  amount: number
  currency: string
  status: PaymentStatus
  gatewayProvider: string | null
  gatewayOrderId: string | null
  /** Checkout / redirect URL from the provider (payOS checkoutUrl, ZaloPay order_url…). */
  paymentUrl: string | null
  /** QR code image URL or data URI (MoMo qrCodeUrl, etc.). */
  qrCodeUrl: string | null
  paidAt: string | null
  expiresAt: string | null
  refundedAt: string | null
  refundedAmount: number | null
  createdAt: string
}

/** Returned by POST /payment/initiate and POST /payment/retry. */
export interface PaymentInitiateResponse {
  paymentOrderId: string
  bookingId: string
  paymentUrl: string | null
  qrCodeUrl: string | null
  expiresAt: string
  gatewayProvider: string
  amount: number
  currency: string
}

export interface BookingSummary {
  totalBookings: number
  upcomingBookings: number
  awaitingConfirmation: number
  recentBookings: BookingResult[]
}

// ─── Display configs ──────────────────────────────────────────────────────────

export const CHANNEL_CONFIG: Record<BookingChannel, { label: string; icon: string; description: string }> = {
  Online:  { label: 'Online (video)',  icon: '💻', description: 'Google Meet or Zoom session' },
  Phone:   { label: 'Phone call',     icon: '📞', description: 'We call you at your preferred number' },
  Email:   { label: 'Email',          icon: '✉️', description: 'Async communication via email' },
  Onsite:  { label: 'Onsite visit',   icon: '🏠', description: 'In-person session at your location' },
}

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  Draft:      'Draft',
  Submitted:  'Awaiting payment',
  Paid:       'Awaiting confirmation',
  Confirmed:  'Confirmed',
  Scheduled:  'Scheduled',
  InProgress: 'In progress',
  Completed:  'Completed',
  Cancelled:  'Cancelled',
  Expired:    'Expired',
}

export const BOOKING_STATUS_BADGE: Record<BookingStatus, BadgeVariant> = {
  Draft:      'neutral',
  Submitted:  'warning',
  Paid:       'info',
  Confirmed:  'info',
  Scheduled:  'purple',
  InProgress: 'purple',
  Completed:  'success',
  Cancelled:  'neutral',
  Expired:    'neutral',
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  Unpaid:           'Payment required',
  Pending:          'Payment pending',
  Paid:             'Paid',
  Failed:           'Payment failed',
  Expired:          'Payment expired',
  Refunded:         'Refunded',
  PartiallyRefunded:'Partially refunded',
}

export const PAYMENT_STATUS_BADGE: Record<PaymentStatus, BadgeVariant> = {
  Unpaid:           'warning',
  Pending:          'warning',
  Paid:             'success',
  Failed:           'danger',
  Expired:          'neutral',
  Refunded:         'info',
  PartiallyRefunded:'info',
}

/** Short human message explaining what the booking's current state means to the user. */
export const BOOKING_STATUS_CONTEXT: Partial<Record<BookingStatus, string>> = {
  Paid:      'Payment received \u2014 our team is reviewing your booking.',
  Confirmed: "Your booking is confirmed! We'll reach out with details.",
  Scheduled: 'Your session is scheduled. See you soon!',
  Completed: 'Your session is complete. Thank you for trusting SafeFamily.',
  Cancelled: 'This booking has been cancelled.',
  Expired:   'This booking expired before payment was completed.',
}

