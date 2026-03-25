import { useState } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { Alert, Button } from '@/components/ui'
import { useRequestAccountDeletion } from '../settings.hooks'
import { cn } from '@/lib/utils'

// ── Delete confirm flow ────────────────────────────────────────────────────────

const CONFIRM_PHRASE = 'DELETE'

function DeleteConfirmForm({ onCancel }: { onCancel: () => void }) {
  const deleteMutation = useRequestAccountDeletion()
  const [value, setValue]   = useState('')
  const [done,  setDone]    = useState(false)
  const confirmed = value.trim() === CONFIRM_PHRASE

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!confirmed) return
    await deleteMutation.mutateAsync()
    setDone(true)
  }

  if (done) {
    return (
      <Alert variant="success">
        Your account deletion request has been received. Our team will process it within 30 days
        and send a confirmation to your registered email address.
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Alert variant="warning">
        <strong>This is irreversible.</strong> All your family data, assessments, incident reports,
        and booking history will be permanently deleted. You will lose access immediately.
      </Alert>

      <div>
        <label htmlFor="del-confirm" className="block text-sm font-medium text-gray-700 mb-1">
          Type <span className="font-mono font-bold text-red-600">{CONFIRM_PHRASE}</span> to confirm
        </label>
        <input
          id="del-confirm"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={CONFIRM_PHRASE}
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm font-mono placeholder-gray-400',
            'focus:outline-none focus:ring-1',
            confirmed
              ? 'border-red-400 focus:border-red-500 focus:ring-red-400'
              : 'border-gray-300 focus:border-gray-400 focus:ring-gray-300',
          )}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {deleteMutation.isError && (
        <Alert variant="error">Failed to submit deletion request. Please try again.</Alert>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          variant="danger"
          size="sm"
          disabled={!confirmed}
          loading={deleteMutation.isPending}
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          Permanently delete my account
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

// ── Public component ──────────────────────────────────────────────────────────

/**
 * DangerZone — visually separated card for destructive account actions.
 * Uses a two-step confirmation flow before calling the deletion API.
 */
export function DangerZone() {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="rounded-2xl border-2 border-red-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-5 py-4">
        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-red-700">Danger Zone</h2>
      </div>

      <div className="px-5 py-5 space-y-4">
        {!confirming ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Delete account</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed max-w-md">
                Permanently remove your SafeFamily account, all family data, and associated records.
                This action cannot be undone.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirming(true)}
              className="shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              Delete account
            </Button>
          </div>
        ) : (
          <DeleteConfirmForm onCancel={() => setConfirming(false)} />
        )}
      </div>
    </div>
  )
}
