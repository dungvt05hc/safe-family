import { useState } from 'react'
import { useUpdateAccount } from '../hooks/useAccountMutations'
import { AccountForm } from './AccountForm'
import type { Account, AccountFormValues } from '../accounts.types'
import { useApiError } from '@/lib/i18n/useApiError'
import { useFamilyMembers } from '@/features/families/hooks/useFamilyMembers'

interface Props {
  account: Account
  onClose: () => void
}

export function EditAccountModal({ account, onClose }: Props) {
  const { mutate, isPending } = useUpdateAccount(account.id)
  const { data: members = [] } = useFamilyMembers()
  const [mutationError, setMutationError] = useState<unknown>(null)
  const serverError = useApiError(mutationError, 'mutation.generic')

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
    setMutationError(null)
    mutate(values, {
      onSuccess: () => onClose(),
      onError: (err) => setMutationError(err),
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
          members={members}
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
