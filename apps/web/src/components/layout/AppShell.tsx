import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileSidebar } from './MobileSidebar'
import { Topbar } from './Topbar'
import { NAV_ITEMS } from './nav-items'

interface AppShellProps {
  children: React.ReactNode
}

/** Derive the page title from the current URL path. */
function usePageTitle(): string {
  const { pathname } = useLocation()
  const match = NAV_ITEMS.find((item) => {
    if (item.href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(item.href)
  })
  return match?.label ?? 'SafeFamily'
}

/**
 * AppShell — the persistent chrome for all authenticated pages.
 *
 * Layout:
 *  ┌──────────────────────────────────┐
 *  │  Sidebar (desktop) │  Topbar     │
 *  │                    ├────────────-│
 *  │  (fixed, 256px)    │  <children> │
 *  └──────────────────────────────────┘
 *
 * On mobile the sidebar collapses into a slide-in drawer
 * triggered by the hamburger button in the Topbar.
 */
export function AppShell({ children }: AppShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const title = usePageTitle()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── Desktop sidebar (hidden on mobile) ─────────────────────── */}
      <Sidebar className="hidden lg:flex shrink-0" />

      {/* ── Mobile sidebar drawer ──────────────────────────────────── */}
      <MobileSidebar
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* ── Main area ───────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          title={title}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-5xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
