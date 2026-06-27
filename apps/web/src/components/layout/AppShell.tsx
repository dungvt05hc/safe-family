import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Sidebar } from './Sidebar'
import { MobileSidebar } from './MobileSidebar'
import { Topbar } from './Topbar'
import { AppFooter } from './AppFooter'
import { useHideFooter } from './useHideFooter'
import { NAV_ITEMS, type NavGroup, type NavItem } from './nav-items'

interface AppShellProps {
  children: React.ReactNode
  navGroups?: NavGroup[]
  /**
   * Directly suppress the global footer for this shell instance.
   * Prefer route-level control via `handle: { hideFooter: true }` in router.tsx;
   * use this prop only when the shell is instantiated outside the router tree.
   */
  hideFooter?: boolean
}

/** Derive the page title from the current URL path. */
function usePageTitle(navItems?: NavItem[]): string {
  const { pathname } = useLocation()
  const { t } = useTranslation('nav')
  const items = navItems ?? NAV_ITEMS
  const match = items.find((item) => {
    if (item.href === '/dashboard' || item.href === '/admin') return pathname === item.href
    return pathname.startsWith(item.href)
  })
  return match ? t(match.label as Parameters<typeof t>[0]) : 'SafeFamily'
}

/**
 * AppShell — the persistent chrome for all authenticated pages.
 *
 * Layout:
 *  ┌──────────────────────────────────┐
 *  │  Sidebar (desktop) │  Topbar     │
 *  │                    ├─────────────│
 *  │  (fixed, 256px)    │  <children> │
 *  │                    ├─────────────│
 *  │                    │  AppFooter  │  ← hidden per-route via handle.hideFooter
 *  └──────────────────────────────────┘
 *
 * On mobile the sidebar collapses into a slide-in drawer triggered by the
 * hamburger button in the Topbar.
 *
 * Footer visibility is controlled in two ways (highest priority first):
 *   1. `hideFooter` prop on this component
 *   2. `handle: { hideFooter: true }` on the active React Router route
 */
export function AppShell({ children, navGroups, hideFooter: hideFooterProp }: AppShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const navItems = navGroups?.flatMap((g) => g.items)
  const title = usePageTitle(navItems)
  const hideFooterFromRoute = useHideFooter()
  const shouldHideFooter = hideFooterProp ?? hideFooterFromRoute

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── Desktop sidebar (hidden on mobile) ─────────────────────── */}
      <Sidebar className="hidden lg:flex shrink-0" navGroups={navGroups} />

      {/* ── Mobile sidebar drawer ──────────────────────────────────── */}
      <MobileSidebar
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        navGroups={navGroups}
      />

      {/* ── Main area ───────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          title={title}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        {/* Scrollable content + footer */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          {/* Page content — constrained to max-w-5xl */}
          <div className="flex-1 p-4 lg:p-6">
            <div className="mx-auto max-w-5xl w-full">
              {children}
            </div>
          </div>

          {/* Footer — full width of the main area, below all page content */}
          {!shouldHideFooter && <AppFooter />}
        </main>
      </div>
    </div>
  )
}
