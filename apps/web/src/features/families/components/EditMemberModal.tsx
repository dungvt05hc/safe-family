import { FamilyMemberForm } from './FamilyMemberForm'
import { useUpdateFamilyMember } from '../hooks/useFamilyMemberMutations'
import type { FamilyMember, FamilyMemberFormValues } from '../families.types'

interface Props {
  member: FamilyMember
  onClose: () => void
}

export function EditMemberModal({ member, onClose }: Props) {
  const update = useUpdateFamilyMember(member.id)

  const defaultValues: FamilyMemberFormValues = {
    displayName: member.displayName,
    relationship: member.relationship,
    ageGroup: member.ageGroup,
    primaryEcosystem: member.primaryEcosystem,
    isPrimaryContact: member.isPrimaryContact,
  }

  function handleSubmit(values: FamilyMemberFormValues) {
    update.mutate(values, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-5 text-lg font-semibold text-gray-800">Edit {member.displayName}</h2>
        <FamilyMemberForm
          submitLabel="Save changes"
          defaultValues={defaultValues}
          isSubmitting={update.isPending}
          serverError={update.error?.message ?? null}
          onCancel={onClose}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
