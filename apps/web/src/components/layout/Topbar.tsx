import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, LogOut, ChevronDown, User, Settings } from 'lucide-react'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { cn } from '@/lib/utils'

interface TopbarProps {
  title: string
  onMenuClick: () => void
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  const { data: user } = useCurrentUser()
  const logout = useLogout()
  const navigate = useNavigate()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
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

  // Get initials from display name
  const initials = user?.displayName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 h-16 bg-white border-b border-gray-200 px-4 lg:px-6">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="text-base font-semibold text-gray-900 truncate mr-auto">{title}</h1>

      {/* Search */}
      <div className="hidden sm:flex items-center gap-2 w-56 lg:w-72 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 focus-within:border-blue-500 focus-within:bg-white transition-colors">
        <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search…"
          aria-label="Search"
          className="flex-1 bg-transparent outline-none placeholder:text-gray-400 text-gray-800"
        />
      </div>

      {/* Notification bell */}
      <button
        aria-label="Notifications"
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {/* Unread badge */}
        <span
          aria-hidden="true"
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"
        />
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
            className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-xs font-bold text-white select-none"
            aria-hidden="true"
          >
            {initials}
          </span>
          <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[140px] truncate">
            {user?.displayName ?? 'Account'}
          </span>
          <ChevronDown
            className={cn(
              'hidden md:block w-4 h-4 text-gray-400 transition-transform duration-200',
              dropdownOpen && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-200 bg-white shadow-lg py-1 text-sm"
          >
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="font-medium text-gray-900 truncate">{user?.displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>

            <button
              role="menuitem"
              onClick={() => { setDropdownOpen(false); navigate('/settings') }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4 text-gray-400" aria-hidden="true" />
              Profile
            </button>

            <button
              role="menuitem"
              onClick={() => { setDropdownOpen(false); navigate('/settings') }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-400" aria-hidden="true" />
              Settings
            </button>

            <div className="border-t border-gray-100 mt-1" />

            <button
              role="menuitem"
              onClick={handleLogout}
              disabled={logout.isPending}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              {logout.isPending ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
