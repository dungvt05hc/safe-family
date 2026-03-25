import { Navigate, useLocation } from 'react-router-dom'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

interface AdminRouteProps {
  children: React.ReactNode
}

/**
 * Wraps routes that require an Admin role.
 * - Loading  → spinner
 * - No user  → redirect to /login
 * - Non-admin user → redirect to /dashboard
 * - Admin    → render children
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { data: user, isLoading } = useCurrentUser()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
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
