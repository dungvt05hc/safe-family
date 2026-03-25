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
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** Show only for admin users */
  adminOnly?: boolean
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Family',
    items: [
      { label: 'Family Members', href: '/family/members', icon: Users },
      { label: 'Accounts',       href: '/accounts',       icon: CreditCard },
      { label: 'Devices',        href: '/devices',        icon: Smartphone },
    ],
  },
  {
    label: 'Safety',
    items: [
      { label: 'Assessments', href: '/assessment', icon: ClipboardCheck },
      { label: 'Checklist',   href: '/checklists', icon: ListChecks },
      { label: 'Incidents',   href: '/incidents',  icon: AlertTriangle },
    ],
  },
  {
    label: 'Support',
    items: [
      { label: 'Bookings', href: '/bookings/my', icon: CalendarDays },
      { label: 'Reports',  href: '/reports',     icon: BarChart2 },
      { label: 'Settings', href: '/settings',    icon: Settings },
    ],
  },
]

/** Flat list derived from NAV_GROUPS — used by AppShell's usePageTitle() */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items)
