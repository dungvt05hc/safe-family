import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Shield, X } from 'lucide-react'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopbar } from './AdminTopbar'
import { NavContent } from '@/components/layout/NavContent'
import { ADMIN_NAV_GROUPS, ADMIN_NAV_ITEMS } from '../admin-nav'
import { pageVariants } from '@/lib/motion'

/** Derive the admin page title from the current path. */
function useAdminPageTitle(): string {
  const { pathname } = useLocation()
  const match = ADMIN_NAV_ITEMS.find((item) => {
    if (item.href === '/admin') return pathname === '/admin'
    return pathname.startsWith(item.href)
  })
  return match?.label ?? 'Admin'
}

/**
 * AdminAppShell — the full-page chrome for every /admin/* route.
 *
 * Layout:
 *  ┌─────────────────────────────────────────┐
 *  │  AdminSidebar (lg+) │  AdminTopbar       │
 *  │                     ├────────────────────│
 *  │   (fixed 256 px)    │  <Outlet>          │
 *  └─────────────────────────────────────────┘
 *
 * On mobile the sidebar is replaced by an animated bottom-anchored
 * drawer triggered by the hamburger in AdminTopbar.
 *
 * Uses dedicated AdminSidebar and AdminTopbar components so the
 * admin chrome is fully independent from the customer app shell.
 */
export function AdminAppShell() {
  const location = useLocation()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const title = useAdminPageTitle()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── Desktop admin sidebar ──────────────────────────────────── */}
      <AdminSidebar />

      {/* ── Mobile admin sidebar overlay ──────────────────────────── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="admin-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
              onClick={() => setMobileSidebarOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              key="admin-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Admin navigation"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-slate-900 text-slate-100 shadow-2xl lg:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 shrink-0">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-base font-semibold tracking-tight">SafeFamily</span>
                    <span className="text-[10px] font-medium uppercase tracking-widest text-amber-400 mt-0.5">
                      Admin
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  aria-label="Close navigation"
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Admin nav in mobile drawer */}
              <NavContent
                navGroups={ADMIN_NAV_GROUPS}
                onItemClick={() => setMobileSidebarOpen(false)}
                itemDelay={0.15}
              />

              <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-500 shrink-0">
                SafeFamily Admin &copy; {new Date().getFullYear()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content area ───────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminTopbar title={title} onMenuClick={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-6xl w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
