import {
  LayoutDashboard,
  Users,
  UserCircle,
  CalendarDays,
  AlertTriangle,
  BarChart2,
  Package,
  Activity,
  StickyNote,
} from 'lucide-react'
import { type NavGroup, type NavItem } from '@/components/layout/nav-items'

/**
 * Admin back-office navigation groups.
 *
 * Organised into two sections:
 *  - Overview   — operational day-to-day views
 *  - Operations — reporting, packages & activity log
 */
export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard',  href: '/admin',             icon: LayoutDashboard },
      { label: 'Users',      href: '/admin/users',       icon: UserCircle },
      { label: 'Customers',  href: '/admin/customers',   icon: Users },
      { label: 'Bookings',   href: '/admin/bookings',    icon: CalendarDays },
      { label: 'Incidents',  href: '/admin/incidents',   icon: AlertTriangle },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Reports',          href: '/admin/reports',   icon: BarChart2 },
      { label: 'Service Packages', href: '/admin/packages',  icon: Package },
      { label: 'Internal Notes',   href: '/admin/notes',     icon: StickyNote },
      { label: 'Audit Log',        href: '/admin/activity',  icon: Activity },
    ],
  },
]

/** Flat list — used by AdminAppShell to derive the current page title. */
export const ADMIN_NAV_ITEMS: NavItem[] = ADMIN_NAV_GROUPS.flatMap((g) => g.items)
