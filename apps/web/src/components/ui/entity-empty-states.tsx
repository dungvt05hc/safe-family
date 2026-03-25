/**
 * entity-empty-states.tsx
 *
 * Pre-configured EmptyState variants for each domain entity.
 * Each accepts a single `onAction` callback so it can be dropped into any page
 * without repeating copy, icons, or colours.
 */

import { Users, CreditCard, Smartphone, ShieldAlert, CalendarDays } from 'lucide-react'
import { EmptyState } from './EmptyState'

// ── Family Members ────────────────────────────────────────────────────────────

export function NoFamilyMembersEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={Users}
      iconColor="bg-blue-50 text-blue-500"
      title="No family members yet"
      description="Add the people in your family to start tracking their digital safety and online habits."
      actionLabel="Add Member"
      onAction={onAdd}
    />
  )
}

// ── Accounts ─────────────────────────────────────────────────────────────────

export function NoAccountsEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={CreditCard}
      iconColor="bg-violet-50 text-violet-500"
      title="No accounts tracked"
      description="Register your family's online accounts to monitor two-factor authentication, recovery settings, and suspicious activity."
      actionLabel="Add Account"
      onAction={onAdd}
    />
  )
}

// ── Devices ───────────────────────────────────────────────────────────────────

export function NoDevicesEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={Smartphone}
      iconColor="bg-indigo-50 text-indigo-500"
      title="No devices registered"
      description="Add your family's phones, tablets, and computers to check their security health — screen lock, backups, OS support, and more."
      actionLabel="Add Device"
      onAction={onAdd}
    />
  )
}

// ── Incidents ─────────────────────────────────────────────────────────────────

export function NoIncidentsEmpty({ onReport }: { onReport: () => void }) {
  return (
    <EmptyState
      icon={ShieldAlert}
      iconColor="bg-amber-50 text-amber-500"
      title="No incidents reported"
      description="All clear! If your family encounters phishing, suspicious logins, or any other threat, report it here so we can guide you through the next steps."
      actionLabel="Report an Incident"
      onAction={onReport}
    />
  )
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export function NoBookingsEmpty({ onBook }: { onBook: () => void }) {
  return (
    <EmptyState
      icon={CalendarDays}
      iconColor="bg-emerald-50 text-emerald-500"
      title="No bookings yet"
      description="Book a one-on-one safety session with our experts. We'll help your family strengthen passwords, review device security, and protect against online threats."
      actionLabel="Book a Session"
      onAction={onBook}
    />
  )
}
