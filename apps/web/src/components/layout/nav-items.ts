import {
  LayoutDashboard,
  Users,
  CreditCard,
  Smartphone,
  ClipboardCheck,
  ListChecks,
  AlertTriangle,
  CalendarDays,
  BarChart2,
  Settings,
  ShieldCheck,
  Package,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react'
import type { FeatureFlags } from '@/lib/featureFlags'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** Show only for admin users */
  adminOnly?: boolean
  /**
   * Feature flag that must be enabled for this item to appear.
   * When omitted the item is always visible.
   */
  featureFlag?: keyof FeatureFlags
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'groups.overview',
    items: [
      { label: 'items.dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'groups.family',
    items: [
      { label: 'items.familyMembers', href: '/family/members', icon: Users },
      { label: 'items.accounts',      href: '/accounts',       icon: CreditCard },
      { label: 'items.devices',       href: '/devices',        icon: Smartphone },
    ],
  },
  {
    label: 'groups.safety',
    items: [
      { label: 'items.assessments',      href: '/assessment', icon: ClipboardCheck },
      { label: 'items.safetyTasks',      href: '/tasks',       icon: ShieldAlert },
      { label: 'items.checklist',        href: '/checklists',  icon: ListChecks },
      { label: 'items.premiumChecklist', href: '/checklist',   icon: ShieldCheck },
      { label: 'items.incidents',        href: '/incidents',   icon: AlertTriangle },
    ],
  },
  {
    label: 'groups.plans',
    items: [
      { label: 'items.safetyPlans',   href: '/plans/safety',            icon: ShieldCheck, featureFlag: 'plansEnabled' },
      { label: 'items.recoveryPacks', href: '/plans/incident-recovery', icon: Package,     featureFlag: 'plansEnabled' },
    ],
  },
  {
    label: 'groups.support',
    items: [
      { label: 'items.bookings', href: '/bookings/my', icon: CalendarDays, featureFlag: 'bookingEnabled' },
      { label: 'items.reports',  href: '/reports',     icon: BarChart2 },
      { label: 'items.settings', href: '/settings',    icon: Settings },
    ],
  },
]

/** Flat list derived from NAV_GROUPS — used by AppShell's usePageTitle() */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items)
