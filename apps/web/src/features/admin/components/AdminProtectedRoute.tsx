import { Navigate, useLocation } from 'react-router-dom'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

interface AdminProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Guard component for all /admin/* routes.
 *
 * Redirect logic:
 *  - Loading     → amber spinner
 *  - Not signed in   → /login (preserving `from` state)
 *  - Signed in, non-admin → /dashboard
 *  - Admin       → render children
 */
export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { data: user, isLoading } = useCurrentUser()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
