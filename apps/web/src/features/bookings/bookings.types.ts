export type BookingChannel = 'Online' | 'Phone' | 'Email'

export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded' | 'Waived'

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
  paymentStatus: PaymentStatus
  createdAt: string
}

export const CHANNEL_CONFIG: Record<BookingChannel, { label: string; icon: string }> = {
  Online: { label: 'Online (video call)', icon: '💻' },
  Phone: { label: 'Phone call', icon: '📞' },
  Email: { label: 'Email', icon: '✉️' },
}

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string }> = {
  Pending: { label: 'Pending', color: 'text-yellow-700 bg-yellow-100' },
  Paid: { label: 'Paid', color: 'text-green-700 bg-green-100' },
  Refunded: { label: 'Refunded', color: 'text-blue-700 bg-blue-100' },
  Waived: { label: 'Waived', color: 'text-gray-700 bg-gray-100' },
}
