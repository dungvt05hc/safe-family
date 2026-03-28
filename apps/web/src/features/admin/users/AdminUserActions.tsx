import { useState } from 'react'
import { KeyRound, ShieldCheck, ShieldOff, Lock, Unlock, UserCheck, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AdminUserDetail, UserStatus } from './adminUsers.types'
import type { UserRole } from '@/features/auth/auth.types'
import { useUpdateUserStatus, useUpdateUserRole, useTriggerPasswordReset } from './adminUsers.hooks'
import { AdminConfirmDialog } from '../components/AdminConfirmDialog'
import { USER_STATUS_COLORS, USER_ROLE_COLORS, formatDateTime } from './adminUsers.utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface StatusAction {
  label: string
  targetStatus: UserStatus
  variant: 'danger' | 'warning' | 'default'
  icon: React.ReactNode
  description: string
}

interface Props {
  user: AdminUserDetail
  /** ID of the currently logged-in admin — used to prevent self-modification. */
  currentAdminId: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStatusActions(status: UserStatus): StatusAction[] {
  switch (status) {
    case 'Active':
      return [
        {
          label: 'Suspend',
          targetStatus: 'Suspended',
          variant: 'warning',
          icon: <ShieldOff className="w-4 h-4" />,
          description: 'The user will be unable to sign in. This can be reversed.',
        },
        {
          label: 'Lock',
          targetStatus: 'Locked',
          variant: 'danger',
          icon: <Lock className="w-4 h-4" />,
          description: 'Immediately blocks the user from signing in, even mid-session.',
        },
      ]
    case 'Suspended':
      return [
        {
          label: 'Activate',
          targetStatus: 'Active',
          variant: 'default',
          icon: <UserCheck className="w-4 h-4" />,
          description: 'Restore normal access for this user.',
        },
        {
          label: 'Lock',
          targetStatus: 'Locked',
          variant: 'danger',
          icon: <Lock className="w-4 h-4" />,
          description: 'Immediately blocks the user from signing in.',
        },
      ]
    case 'Locked':
      return [
        {
          label: 'Unlock',
          targetStatus: 'Active',
          variant: 'default',
          icon: <Unlock className="w-4 h-4" />,
          description: 'Remove the lock and restore normal access.',
        },
        {
          label: 'Suspend',
          targetStatus: 'Suspended',
          variant: 'warning',
          icon: <ShieldOff className="w-4 h-4" />,
          description: 'Keep access blocked under a suspension state.',
        },
      ]
    case 'Deactivated':
      return [
        {
          label: 'Reactivate',
          targetStatus: 'Active',
          variant: 'default',
          icon: <UserCheck className="w-4 h-4" />,
          description: 'Restore this account. The user will be able to sign in again.',
        },
      ]
  }
}

// ── Inline feedback banner ────────────────────────────────────────────────────

function ActionFeedback({ ok, message }: { ok: boolean; message: string }) {
  return (
    <p
      role="status"
      className={cn(
        'text-xs px-3 py-1.5 rounded-lg',
        ok ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50',
      )}
    >
      {message}
    </p>
  )
}

// ── ResetTokenDialog ──────────────────────────────────────────────────────────

function ResetTokenDialog({
  token,
  expiresAt,
  onClose,
}: {
  token: string
  expiresAt: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const resetUrl = `${window.location.origin}/reset-password?token=${token}`

  function copyUrl() {
    navigator.clipboard.writeText(resetUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-token-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl p-6 space-y-4">
        <div>
          <h2 id="reset-token-title" className="text-base font-semibold text-gray-900">
            Password reset link generated
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Share this link with the user via a secure channel. It expires{' '}
            <strong>{formatDateTime(expiresAt)}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border bg-gray-50 px-3 py-2">
          <code className="text-xs text-gray-700 flex-1 truncate">{resetUrl}</code>
          <button
            type="button"
            onClick={copyUrl}
            aria-label="Copy reset link"
            className="shrink-0 text-gray-500 hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
          >
            {copied
              ? <Check className="w-4 h-4 text-green-500" />
              : <Copy className="w-4 h-4" />
            }
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function AdminUserActions({ user, currentAdminId }: Props) {
  const isSelf = user.id === currentAdminId

  // ── Status mutation ───────────────────────────────────────────────────────
  const statusMutation = useUpdateUserStatus(user.id)
  const [pendingStatus, setPendingStatus] = useState<StatusAction | null>(null)
  const [statusFeedback, setStatusFeedback] = useState<{ ok: boolean; message: string } | null>(null)

  function requestStatusChange(action: StatusAction) {
    // Non-destructive transitions (Activate/Unlock/Reactivate) skip the dialog
    if (action.variant === 'default') {
      executeStatusChange(action.targetStatus)
    } else {
      setPendingStatus(action)
    }
  }

  function executeStatusChange(status: UserStatus) {
    setPendingStatus(null)
    setStatusFeedback(null)
    statusMutation.mutate(status, {
      onSuccess: () => setStatusFeedback({ ok: true, message: `Status updated to ${status}.` }),
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to update status.'
        setStatusFeedback({ ok: false, message: msg })
      },
    })
  }

  // ── Role mutation ─────────────────────────────────────────────────────────
  const roleMutation = useUpdateUserRole(user.id)
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null)
  const [roleFeedback, setRoleFeedback] = useState<{ ok: boolean; message: string } | null>(null)

  function executeRoleChange(role: UserRole) {
    setPendingRole(null)
    setRoleFeedback(null)
    roleMutation.mutate(role, {
      onSuccess: () => setRoleFeedback({ ok: true, message: `Role updated to ${role}.` }),
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to update role.'
        setRoleFeedback({ ok: false, message: msg })
      },
    })
  }

  const toggleRole: UserRole = user.role === 'Admin' ? 'User' : 'Admin'

  // ── Password reset mutation ───────────────────────────────────────────────
  const resetMutation = useTriggerPasswordReset(user.id)
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetResult, setResetResult] = useState<{ token: string; expiresAt: string } | null>(null)
  const [resetFeedback, setResetFeedback] = useState<{ ok: boolean; message: string } | null>(null)

  function executePasswordReset() {
    setConfirmReset(false)
    setResetFeedback(null)
    resetMutation.mutate(undefined, {
      onSuccess: (data) => setResetResult(data),
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to trigger password reset.'
        setResetFeedback({ ok: false, message: msg })
      },
    })
  }

  const statusActions = getStatusActions(user.status)

  return (
    <>
      <div className="rounded-lg border bg-white shadow-sm divide-y divide-gray-100">
        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-700">Account Actions</h2>
          {isSelf && (
            <p className="mt-1 text-xs text-amber-600">
              You cannot modify your own account.
            </p>
          )}
        </div>

        {/* ── Status ───────────────────────────────────────────────────── */}
        <div className="px-6 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 w-14 shrink-0">Status</span>
            <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', USER_STATUS_COLORS[user.status])}>
              {user.status}
            </span>
          </div>
          {!isSelf && (
            <div className="flex flex-wrap gap-2">
              {statusActions.map((action) => (
                <button
                  key={action.targetStatus}
                  type="button"
                  disabled={statusMutation.isPending}
                  onClick={() => requestStatusChange(action)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50',
                    action.variant === 'danger'
                      ? 'border-red-200 text-red-600 hover:bg-red-50 focus-visible:ring-red-400'
                      : action.variant === 'warning'
                        ? 'border-yellow-200 text-yellow-700 hover:bg-yellow-50 focus-visible:ring-yellow-400'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-300',
                  )}
                >
                  {action.icon}
                  {statusMutation.isPending ? 'Saving…' : action.label}
                </button>
              ))}
            </div>
          )}
          {statusFeedback && <ActionFeedback {...statusFeedback} />}
        </div>

        {/* ── Role ─────────────────────────────────────────────────────── */}
        <div className="px-6 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 w-14 shrink-0">Role</span>
            <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', USER_ROLE_COLORS[user.role])}>
              {user.role}
            </span>
          </div>
          {!isSelf && (
            <button
              type="button"
              disabled={roleMutation.isPending}
              onClick={() => setPendingRole(toggleRole)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50',
                user.role === 'User'
                  ? 'border-amber-200 text-amber-700 hover:bg-amber-50 focus-visible:ring-amber-400'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-300',
              )}
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              {roleMutation.isPending ? 'Saving…' : user.role === 'User' ? 'Promote to Admin' : 'Demote to User'}
            </button>
          )}
          {roleFeedback && <ActionFeedback {...roleFeedback} />}
        </div>

        {/* ── Password ─────────────────────────────────────────────────── */}
        <div className="px-6 py-4 space-y-3">
          <p className="text-xs font-medium text-gray-500">Password</p>
          <button
            type="button"
            disabled={resetMutation.isPending}
            onClick={() => setConfirmReset(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" aria-hidden="true" />
            {resetMutation.isPending ? 'Generating…' : 'Send Password Reset'}
          </button>
          {resetFeedback && <ActionFeedback {...resetFeedback} />}
        </div>
      </div>

      {/* ── Confirmation dialogs ──────────────────────────────────────── */}
      {pendingStatus && (
        <AdminConfirmDialog
          open={true}
          title={`${pendingStatus.label} this user?`}
          description={pendingStatus.description}
          confirmLabel={pendingStatus.label}
          variant={pendingStatus.variant}
          isLoading={statusMutation.isPending}
          onConfirm={() => executeStatusChange(pendingStatus.targetStatus)}
          onCancel={() => setPendingStatus(null)}
        />
      )}

      <AdminConfirmDialog
        open={pendingRole !== null}
        title={`Change role to ${pendingRole}?`}
        description={
          pendingRole === 'Admin'
            ? 'This user will gain full admin access to the platform. Only do this for trusted staff.'
            : "This will remove the user's admin privileges immediately."
        }
        confirmLabel="Change Role"
        variant={pendingRole === 'Admin' ? 'warning' : 'default'}
        isLoading={roleMutation.isPending}
        onConfirm={() => pendingRole && executeRoleChange(pendingRole)}
        onCancel={() => setPendingRole(null)}
      />

      <AdminConfirmDialog
        open={confirmReset}
        title="Trigger password reset?"
        description="A one-time reset link (valid for 24 hours) will be generated. Share it with the user via a secure channel."
        confirmLabel="Generate Link"
        variant="default"
        isLoading={resetMutation.isPending}
        onConfirm={executePasswordReset}
        onCancel={() => setConfirmReset(false)}
      />

      {/* ── Reset token copy dialog ───────────────────────────────────── */}
      {resetResult && (
        <ResetTokenDialog
          token={resetResult.token}
          expiresAt={resetResult.expiresAt}
          onClose={() => setResetResult(null)}
        />
      )}
    </>
  )
}
