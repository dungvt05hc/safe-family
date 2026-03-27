import { useState } from 'react'
import { useCreateAccount } from '../hooks/useAccountMutations'
import { AccountForm } from './AccountForm'
import type { AccountFormValues } from '../accounts.types'
import { ApiError } from '@/types/api'
import { useFamilyMembers } from '@/features/families/hooks/useFamilyMembers'

interface Props {
  onClose: () => void
}

export function AddAccountModal({ onClose }: Props) {
  const { mutate, isPending } = useCreateAccount()
  const { data: members = [] } = useFamilyMembers()
  const [serverError, setServerError] = useState<string | null>(null)

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
      aria-labelledby="add-account-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 id="add-account-title" className="mb-4 text-lg font-semibold text-gray-900">
          Add account
        </h2>
        <AccountForm
          members={members}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isPending}
          submitLabel="Add account"
          serverError={serverError}
        />
      </div>
    </div>
  )
}
