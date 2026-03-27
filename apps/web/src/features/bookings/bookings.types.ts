import type { BadgeVariant } from '@/components/ui'

// ─── Enums / union types ──────────────────────────────────────────────────────

export type BookingChannel = 'Online' | 'Phone' | 'Email' | 'Onsite'

export type BookingStatus = 'Pending' | 'Confirmed' | 'InProgress' | 'Cancelled' | 'Completed'

export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded' | 'Waived'

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
}

export interface BookingResult {
  id: string
  familyId: string
  packageId: string
  packageName: string
  preferredStartAt: string
  channel: BookingChannel
  notes: string | null
  status: BookingStatus
  paymentStatus: PaymentStatus
  createdAt: string
  updatedAt: string
}

export interface BookingSummary {
  totalBookings: number
  upcomingBookings: number
  pendingConfirmations: number
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
  Pending:    'Awaiting confirmation',
  Confirmed:  'Confirmed',
  InProgress: 'In Progress',
  Cancelled:  'Cancelled',
  Completed:  'Completed',
}

export const BOOKING_STATUS_BADGE: Record<BookingStatus, BadgeVariant> = {
  Pending:    'warning',
  Confirmed:  'info',
  InProgress: 'purple',
  Cancelled:  'neutral',
  Completed:  'success',
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  Pending:  'Payment pending',
  Paid:     'Paid',
  Refunded: 'Refunded',
  Waived:   'Waived',
}

export const PAYMENT_STATUS_BADGE: Record<PaymentStatus, BadgeVariant> = {
  Pending:  'warning',
  Paid:     'success',
  Refunded: 'info',
  Waived:   'neutral',
}

