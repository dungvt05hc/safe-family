import { FamilyMemberForm } from './FamilyMemberForm'
import { useAddFamilyMember } from '../hooks/useFamilyMemberMutations'
import type { FamilyMemberFormValues } from '../families.types'

interface Props {
  onClose: () => void
}

export function AddMemberModal({ onClose }: Props) {
  const add = useAddFamilyMember()

  function handleSubmit(values: FamilyMemberFormValues) {
    add.mutate(values, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-5 text-lg font-semibold text-gray-800">Add family member</h2>
        <FamilyMemberForm
          submitLabel="Add member"
          isSubmitting={add.isPending}
          serverError={add.error?.message ?? null}
          onCancel={onClose}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
