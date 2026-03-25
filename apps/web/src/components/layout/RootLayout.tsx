import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useLogout } from '@/features/auth/hooks/useLogout'

/**
 * RootLayout — persistent shell rendered for every route.
 * Houses the top nav and the <Outlet /> where child routes render.
 */
export function RootLayout() {
  const { data: user, isLoading } = useCurrentUser()
  const logout = useLogout()
  const navigate = useNavigate()

  function handleLogout() {
    logout.mutate(undefined, { onSuccess: () => navigate('/login', { replace: true }) })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg text-blue-600 tracking-tight">
            SafeFamily
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900 transition-colors'
              }
            >
              Home
            </NavLink>
            {/* Add more nav links as features are built */}
          </nav>

          {/* Auth controls — hidden while session check is in flight */}
          {!isLoading && (
            <div className="flex items-center gap-4 text-sm">
              {user ? (
                <>
                  <span className="text-gray-600">{user.displayName}</span>
                  <button
                    onClick={handleLogout}
                    disabled={logout.isPending}
                    className="font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-md bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} SafeFamily
      </footer>
    </div>
  )
}
