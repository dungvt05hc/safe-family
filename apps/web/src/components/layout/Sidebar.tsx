import { ShieldCheck } from 'lucide-react'
import { NavContent } from './NavContent'
import { type NavGroup } from './nav-items'
import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
  navGroups?: NavGroup[]
}

export function Sidebar({ className, navGroups }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col w-64 bg-slate-900 text-slate-100 min-h-screen',
        className,
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <span className="text-base font-semibold tracking-tight">SafeFamily</span>
      </div>

      {/* Navigation */}
      <NavContent navGroups={navGroups} />

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-500">
        SafeFamily &copy; {new Date().getFullYear()}
      </div>
    </aside>
  )
}
