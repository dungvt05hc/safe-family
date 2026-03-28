import type { AuditLogPage } from '../admin.types'

export type { AuditLogPage as ActivityListResponse }

export interface ActivityFilters {
  action?: string
  from?: string
  to?: string
  page: number
  pageSize: number
}

/**
 * Known audit-log action strings used throughout the system.
 * Displayed as human-readable labels in the filter dropdown.
 */
export const ACTIVITY_ACTIONS: { value: string; label: string }[] = [
  { value: 'LoginSuccess', label: 'Login Success' },
  { value: 'LoginFailure', label: 'Login Failure' },
  { value: 'RegisterSuccess', label: 'User Registered' },
  { value: 'BookingCreated', label: 'Booking Created' },
  { value: 'AdminBookingStatusChanged', label: 'Booking Status Updated' },
  { value: 'AdminBookingPaymentStatusChanged', label: 'Booking Payment Updated' },
  { value: 'AdminBookingAssigned', label: 'Booking Assigned' },
  { value: 'IncidentCreated', label: 'Incident Created' },
  { value: 'IncidentStatusUpdated', label: 'Incident Status Updated (User)' },
  { value: 'AdminIncidentStatusChanged', label: 'Incident Status Updated (Admin)' },
  { value: 'AdminServicePackageCreated', label: 'Service Package Created' },
  { value: 'AdminServicePackageUpdated', label: 'Service Package Updated' },
  { value: 'AdminServicePackageStatusUpdated', label: 'Service Package Status Updated' },
  { value: 'AdminUserStatusChanged', label: 'User Status Changed' },
  { value: 'AdminUserRoleChanged', label: 'User Role Changed' },
  { value: 'AdminPasswordResetTriggered', label: 'Password Reset Triggered' },
  { value: 'AdminNoteCreated', label: 'Admin Note Created' },
  { value: 'AdminCustomerNoteAdded', label: 'Customer Note Added' },
  { value: 'AdminBookingNoteAdded', label: 'Booking Note Added' },
  { value: 'AdminIncidentNoteAdded', label: 'Incident Note Added' },
]

/** Resolve an action string to its human-readable label. */
export function formatActionLabel(action: string): string {
  return ACTIVITY_ACTIONS.find((a) => a.value === action)?.label ?? action
}

/** Colour badge mapping by action prefix/category. */
export function getActionColor(action: string): string {
  if (action.startsWith('Login') || action === 'RegisterSuccess')
    return 'bg-green-100 text-green-700'
  if (action.includes('Booking'))
    return 'bg-blue-100 text-blue-700'
  if (action.includes('Incident'))
    return 'bg-red-100 text-red-700'
  if (action.includes('ServicePackage'))
    return 'bg-purple-100 text-purple-700'
  if (action.includes('User') || action.includes('Password'))
    return 'bg-amber-100 text-amber-700'
  if (action.includes('Note'))
    return 'bg-yellow-100 text-yellow-700'
  return 'bg-gray-100 text-gray-700'
}
