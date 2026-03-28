import { Shield } from 'lucide-react'
import { NavContent } from '@/components/layout/NavContent'
import { ADMIN_NAV_GROUPS } from '../admin-nav'

/**
 * AdminSidebar — persistent left-rail navigation for the Admin back-office.
 *
 * Desktop only (hidden on mobile — mobile uses AdminMobileSidebar drawer).
 * Amber-accented brand header distinguishes it from the customer sidebar.
 */
export function AdminSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-100 min-h-screen shrink-0">
      {/* Brand header */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col leading-none min-w-0">
          <span className="text-base font-semibold tracking-tight truncate">SafeFamily</span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-amber-400 mt-0.5">
            Admin
          </span>
        </div>
      </div>

      {/* Navigation */}
      <NavContent navGroups={ADMIN_NAV_GROUPS} />

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-500 shrink-0">
        SafeFamily Admin &copy; {new Date().getFullYear()}
      </div>
    </aside>
  )
}
