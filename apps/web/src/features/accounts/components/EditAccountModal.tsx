import { useState } from 'react'
import { useUpdateAccount } from '../hooks/useAccountMutations'
import { AccountForm } from './AccountForm'
import type { Account, AccountFormValues } from '../accounts.types'
import { ApiError } from '@/types/api'

interface Props {
  account: Account
  onClose: () => void
}

export function EditAccountModal({ account, onClose }: Props) {
  const { mutate, isPending } = useUpdateAccount(account.id)
  const [serverError, setServerError] = useState<string | null>(null)

  const defaultValues: AccountFormValues = {
    memberId: account.memberId ?? '',
    accountType: account.accountType,
    maskedIdentifier: account.maskedIdentifier,
    twoFactorStatus: account.twoFactorStatus,
    recoveryEmailStatus: account.recoveryEmailStatus,
    recoveryPhoneStatus: account.recoveryPhoneStatus,
    suspiciousActivityFlag: account.suspiciousActivityFlag,
    notes: account.notes ?? '',
  }

  function handleSubmit(values: AccountFormValues) {
    setServerError(null)
    mutate(values, {
      onSuccess: () => onClose(),
      onError: (err) => {
        setServerError(err instanceof ApiError ? err.message : 'Something went wrong.')
      },
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-account-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 id="edit-account-title" className="mb-4 text-lg font-semibold text-gray-900">
          Edit account
        </h2>
        <AccountForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isPending}
          submitLabel="Save changes"
          serverError={serverError}
        />
      </div>
    </div>
  )
}
