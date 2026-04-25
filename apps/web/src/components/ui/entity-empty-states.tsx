/**
 * entity-empty-states.tsx
 *
 * Pre-configured EmptyState variants for each domain entity.
 * Each accepts a single `onAction` callback so it can be dropped into any page
 * without repeating copy, icons, or colours.
 */

import { Users, CreditCard, Smartphone, ShieldAlert, CalendarDays } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EmptyState } from './EmptyState'

// ── Family Members ────────────────────────────────────────────────────────────

export function NoFamilyMembersEmpty({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation('emptyStates')
  return (
    <EmptyState
      icon={Users}
      iconColor="bg-blue-50 text-blue-500"
      title={t('familyMembers.title')}
      description={t('familyMembers.description')}
      actionLabel={t('familyMembers.action')}
      onAction={onAdd}
    />
  )
}

// ── Accounts ─────────────────────────────────────────────────────────────────

export function NoAccountsEmpty({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation('emptyStates')
  return (
    <EmptyState
      icon={CreditCard}
      iconColor="bg-violet-50 text-violet-500"
      title={t('accounts.title')}
      description={t('accounts.description')}
      actionLabel={t('accounts.action')}
      onAction={onAdd}
    />
  )
}

// ── Devices ───────────────────────────────────────────────────────────────────

export function NoDevicesEmpty({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation('emptyStates')
  return (
    <EmptyState
      icon={Smartphone}
      iconColor="bg-indigo-50 text-indigo-500"
      title={t('devices.title')}
      description={t('devices.description')}
      actionLabel={t('devices.action')}
      onAction={onAdd}
    />
  )
}

// ── Incidents ─────────────────────────────────────────────────────────────────

export function NoIncidentsEmpty({ onReport }: { onReport: () => void }) {
  const { t } = useTranslation('emptyStates')
  return (
    <EmptyState
      icon={ShieldAlert}
      iconColor="bg-amber-50 text-amber-500"
      title={t('incidents.title')}
      description={t('incidents.description')}
      actionLabel={t('incidents.action')}
      onAction={onReport}
    />
  )
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export function NoBookingsEmpty({ onBook }: { onBook: () => void }) {
  const { t } = useTranslation('emptyStates')
  return (
    <EmptyState
      icon={CalendarDays}
      iconColor="bg-emerald-50 text-emerald-500"
      title={t('bookings.title')}
      description={t('bookings.description')}
      actionLabel={t('bookings.action')}
      onAction={onBook}
    />
  )
}
