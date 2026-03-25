import { Navigate, useLocation } from 'react-router-dom'
import { useCurrentUser } from '../hooks/useCurrentUser'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Wraps routes that require an authenticated session.
 *
 * Behaviour:
 * - Loading  → spinner (prevents flash-of-redirect while session is resolved)
 * - No user  → redirect to /login, preserving the attempted URL in `state.from`
 * - Has user → render children
 *
 * Usage in router.tsx:
 *   { path: 'dashboard', element: <ProtectedRoute><DashboardPage /></ProtectedRoute> }
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: user, isLoading } = useCurrentUser()
  const location = useLocation()

  if (isLoading) return <AuthSpinner />

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

/** Inline spinner — avoids creating a separate file for a 3-line component. */
function AuthSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
    </div>
  )
}
