import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminUserDetail } from './adminUsers.hooks'
import { USER_ROLE_COLORS, USER_STATUS_COLORS, formatDate, formatDateTime } from './adminUsers.utils'
import { AdminSpinner, AdminError } from '../components/AdminStateViews'
import { AdminUserActions } from './AdminUserActions'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-3 border-b border-gray-100 last:border-0">
      <dt className="w-44 shrink-0 text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{children}</dd>
    </div>
  )
}

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: user, isLoading, isError, refetch } = useAdminUserDetail(id ?? '')
  const { data: currentUser } = useCurrentUser()

  if (!id) return <Navigate to="/admin/users" replace />

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back nav */}
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Users
      </Link>

      {isLoading ? (
        <div className="rounded-lg border bg-white shadow-sm">
          <AdminSpinner />
        </div>
      ) : isError ? (
        <div className="rounded-lg border bg-white shadow-sm">
          <AdminError message="Failed to load user details." onRetry={() => refetch()} />
        </div>
      ) : user ? (
        <>
          {/* Header card */}
          <div className="rounded-lg border bg-white shadow-sm p-6 flex items-start gap-4">
            <div
              className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 text-amber-700 text-xl font-bold shrink-0"
              aria-hidden="true"
            >
              {user.displayName.trim().charAt(0).toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">{user.displayName}</h1>
              <p className="text-sm text-gray-500 mt-0.5 truncate">{user.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', USER_ROLE_COLORS[user.role])}>
                  {user.role}
                </span>
                <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', USER_STATUS_COLORS[user.status])}>
                  {user.status}
                </span>
                {user.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    Email verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium">
                    <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    Email not verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="rounded-lg border bg-white shadow-sm px-6 py-2">
            <dl>
              <DetailRow label="User ID">
                <code className="text-xs text-gray-500">{user.id}</code>
              </DetailRow>
              <DetailRow label="Email">{user.email}</DetailRow>
              <DetailRow label="Display name">{user.displayName}</DetailRow>
              <DetailRow label="Phone">
                {user.phone ?? <span className="text-gray-400">—</span>}
              </DetailRow>
              <DetailRow label="Role">
                <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', USER_ROLE_COLORS[user.role])}>
                  {user.role}
                </span>
              </DetailRow>
              <DetailRow label="Status">
                <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', USER_STATUS_COLORS[user.status])}>
                  {user.status}
                </span>
              </DetailRow>
              <DetailRow label="Email verified">
                {user.emailVerified
                  ? <span className="text-green-600 font-medium">Yes</span>
                  : <span className="text-gray-400">No</span>}
              </DetailRow>
              <DetailRow label="Joined">{formatDate(user.createdAt)}</DetailRow>
              <DetailRow label="Last updated">{formatDate(user.updatedAt)}</DetailRow>
              <DetailRow label="Last login">
                {user.lastLoginAt
                  ? formatDateTime(user.lastLoginAt)
                  : <span className="text-gray-400">Never</span>}
              </DetailRow>
            </dl>
          </div>

          {/* Linked family */}
          {user.family ? (
            <div className="rounded-lg border bg-white shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" aria-hidden="true" />
                Linked Family
              </h2>
              <dl>
                <DetailRow label="Family name">{user.family.familyName}</DetailRow>
                <DetailRow label="Member role">{user.family.familyMemberRole}</DetailRow>
                <DetailRow label="Family ID">
                  <code className="text-xs text-gray-500">{user.family.familyId}</code>
                </DetailRow>
              </dl>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-gray-50 p-6 text-center text-sm text-gray-400">
              This user is not linked to any family.
            </div>
          )}

          {/* Account actions */}
          {currentUser && (
            <AdminUserActions user={user} currentAdminId={currentUser.id} />
          )}
        </>
      ) : null}
    </div>
  )
}
