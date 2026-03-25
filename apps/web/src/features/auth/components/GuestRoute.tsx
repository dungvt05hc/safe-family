import { Navigate, useLocation } from 'react-router-dom'
import { useCurrentUser } from '../hooks/useCurrentUser'

interface GuestRouteProps {
  children: React.ReactNode
  /** Where to send authenticated users. Defaults to /dashboard. */
  redirectTo?: string
}

/**
 * Wraps routes that should only be accessible to unauthenticated users
 * (login, register, password reset, etc.).
 *
 * Behaviour:
 * - Loading  → spinner (prevents the form flashing before redirect)
 * - Has user → redirect to `redirectTo` (default: /dashboard)
 * - No user  → render children
 *
 * Usage in router.tsx:
 *   { path: '/login', element: <GuestRoute><LoginPage /></GuestRoute> }
 */
export function GuestRoute({ children, redirectTo = '/dashboard' }: GuestRouteProps) {
  const { data: user, isLoading } = useCurrentUser()
  const location = useLocation()

  if (isLoading) return <AuthSpinner />

  if (user) {
    // If the user arrived here after being redirected from a protected route,
    // honour the original destination rather than always going to /dashboard.
    const destination =
      (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? redirectTo
    return <Navigate to={destination} replace />
  }

  return <>{children}</>
}

function AuthSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
    </div>
  )
}
