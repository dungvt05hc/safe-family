import type { BadgeVariant } from '@/components/ui'

// ─── Enums / union types ──────────────────────────────────────────────────────

export type BookingChannel = 'Online' | 'Phone' | 'Email' | 'Onsite'

export type BookingSource = 'Direct' | 'IncidentFollowUp' | 'AssessmentFollowUp' | 'AdminCreated'

export type BookingUrgency = 'Routine' | 'Urgent' | 'Critical'

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
  code: string
  name: string
  description: string
  priceDisplay: string
  durationLabel: string
}

export interface CreateBookingRequest {
  packageId: string
  helpTopic: string
  urgency?: BookingUrgency
  affectedMember?: string
  affectedTarget?: string
  desiredOutcome?: string
  affectedAccountId?: string
  affectedDeviceId?: string
  customerNotes?: string
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
  confirmedStartAt: string | null
  confirmedEndAt: string | null
  channel: BookingChannel
  source: BookingSource
  sourceIncidentId: string | null
  sourceAssessmentId: string | null
  customerNotes: string | null
  status: BookingStatus
  paymentStatus: PaymentStatus
  /** UTC deadline for the current payment session. Null when not in Pending state. */
  expiresAt: string | null
  completedAt: string | null
  assignedAdminUserId: string | null
  assignedAdminEmail: string | null
  createdAt: string
  updatedAt: string
  primaryReport: BookingReportInfo | null
  helpTopic: string | null
  urgency: BookingUrgency | null
  affectedTarget: string | null
  affectedMember: string | null
  desiredOutcome: string | null
  affectedAccountId: string | null
  affectedDeviceId: string | null
  deliveryStatus: 'Pending' | 'Processing' | 'Delivered' | 'Failed'
  deliveredAt: string | null
}

export interface BookingReportInfo {
  reportId: string
  reportType: 'Assessment' | 'Incident' | 'FamilyReset' | 'SafetyPlan' | 'IncidentRecovery' | 'General'
  title: string
  description: string
  fileUrl: string | null
  generatedAt: string
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
  paymentType: string
  failureReason: string | null
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

/** Matches the backend BookingEventResponse DTO. */
export interface BookingEventResponse {
  id: string
  eventType: string
  fromValue: string | null
  toValue: string | null
  description: string | null
  actorId: string | null
  actorEmail: string | null
  createdAt: string
}

// ─── Display configs ──────────────────────────────────────────────────────────

/**
 * Source labels shown on booking cards.
 * `null` for Direct (the default — no extra label needed).
 */
export const BOOKING_SOURCE_CONFIG: Record<BookingSource, { label: string; icon: string } | null> = {
  Direct:             null,
  IncidentFollowUp:   { label: 'Incident follow-up',    icon: '🚨' },
  AssessmentFollowUp: { label: 'Assessment follow-up',  icon: '📋' },
  AdminCreated:       { label: 'Arranged by our team',  icon: '👥' },
}

export interface ChannelConfig {
  label: string
  sublabel: string
  icon: string
  description: string
  helperText: string
  /** Shown as a small badge on the card. */
  badge?: { text: string; className: string }
  /** Card is visually de-emphasised and shows an availability note. */
  secondary?: boolean
}

export const CHANNEL_CONFIG: Record<BookingChannel, ChannelConfig> = {
  Online: {
    label:       'Online (video)',
    sublabel:    'Google Meet or Zoom',
    icon:        '💻',
    description: 'Join from anywhere — no travel required.',
    helperText:  'We send a calendar invite with a meeting link after confirming your booking.',
    badge:       { text: 'Recommended', className: 'bg-blue-100 text-blue-700' },
  },
  Phone: {
    label:       'Phone call',
    sublabel:    'We call you',
    icon:        '📞',
    description: 'No app or sign-in needed — just answer your phone.',
    helperText:  "Add your preferred number in the notes field below and we'll call at your chosen time.",
  },
  Email: {
    label:       'Email follow-up',
    sublabel:    'Written advice',
    icon:        '✉️',
    description: 'Prefer writing things down? Great for ongoing or low-urgency questions.',
    helperText:  "We'll email you a personalised written safety plan — no live session required.",
  },
  Onsite: {
    label:       'Onsite visit',
    sublabel:    'Advisor comes to you',
    icon:        '🏠',
    description: 'Hands-on help with devices in your home.',
    helperText:  'Subject to advisor availability in your area. We\'ll confirm feasibility after you book.',
    secondary:   true,
  },
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
  Paid:       'Payment received — our advisors are personalising your safety materials.',
  Confirmed:  'Your order is confirmed. Your materials will be ready soon.',
  Scheduled:  'Your safety materials are scheduled for delivery.',
  InProgress: 'Your safety materials are being prepared.',
  Completed:  'Your safety materials are ready. Check your reports below.',
  Cancelled:  'This order has been cancelled.',
  Expired:    'This order expired before payment was completed.',
}

