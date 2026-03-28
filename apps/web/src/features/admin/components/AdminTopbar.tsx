import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, LogOut, ExternalLink } from 'lucide-react'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useLogout } from '@/features/auth/hooks/useLogout'

interface AdminTopbarProps {
  title: string
  onMenuClick: () => void
}

/**
 * AdminTopbar — sticky header for the admin back-office shell.
 *
 * Differences from the customer Topbar:
 *  - Amber "Admin" pill badge on the right of the page title
 *  - Avatar uses amber background instead of blue
 *  - User dropdown includes a "Customer Portal" shortcut
 *  - No search bar (admin pages use per-page search when needed)
 */
export function AdminTopbar({ title, onMenuClick }: AdminTopbarProps) {
  const { data: user } = useCurrentUser()
  const logout = useLogout()
  const navigate = useNavigate()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    setDropdownOpen(false)
    logout.mutate(undefined, { onSuccess: () => navigate('/login', { replace: true }) })
  }

  const initials =
    user?.displayName
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 h-16 bg-white border-b border-gray-200 px-4 lg:px-6 shrink-0">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title + Admin badge */}
      <div className="flex items-center gap-2.5 mr-auto min-w-0">
        <p className="text-base font-semibold text-gray-900 truncate">{title}</p>
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
          Admin
        </span>
      </div>

      {/* Notification bell */}
      <button
        aria-label="Notifications"
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        <Bell className="w-5 h-5" />
      </button>

      {/* Avatar dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={dropdownOpen}
          aria-label="Account menu"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors"
        >
          <span
            className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-xs font-bold text-white select-none shrink-0"
            aria-hidden="true"
          >
            {initials}
          </span>
          <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[140px] truncate">
            {user?.displayName ?? 'Admin'}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block shrink-0" aria-hidden="true" />
        </button>

        {dropdownOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-1 w-52 rounded-xl bg-white shadow-lg ring-1 ring-black/5 py-1 z-50"
          >
            {/* User info */}
            <div className="px-4 py-2.5 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-900 truncate">{user?.displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>

            {/* Customer portal shortcut */}
            <button
              role="menuitem"
              onClick={() => { setDropdownOpen(false); navigate('/dashboard') }}
              className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
              Customer Portal
            </button>

            {/* Sign out */}
            <button
              role="menuitem"
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
