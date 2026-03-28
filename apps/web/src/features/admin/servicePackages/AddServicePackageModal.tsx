import type { ApiError } from '@/types/api'
import { ServicePackageForm, EMPTY_SERVICE_PACKAGE_FORM } from './ServicePackageForm'
import { ServicePackageDialog } from './ServicePackageDialog'
import { useCreateAdminServicePackage } from './adminServicePackages.hooks'
import { toCreateRequest } from './adminServicePackages.schema'
import type { ServicePackageFormValues } from './adminServicePackages.types'

interface AddServicePackageModalProps {
  open: boolean
  onClose: () => void
}

export function AddServicePackageModal({ open, onClose }: AddServicePackageModalProps) {
  const createMutation = useCreateAdminServicePackage()

  if (!open) return null

  function handleSubmit(values: ServicePackageFormValues) {
    createMutation.mutate(toCreateRequest(values), {
      onSuccess: () => onClose(),
    })
  }

  const errorMessage = createMutation.isError
    ? (createMutation.error as ApiError).message
    : undefined

  return (
    <ServicePackageDialog
      open={open}
      title="Add service package"
      description="Create a new package for admin and booking workflows."
      errorMessage={errorMessage}
      onClose={onClose}
    >
      <ServicePackageForm
        initialValues={EMPTY_SERVICE_PACKAGE_FORM}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={createMutation.isPending}
        submitLabel="Create package"
        fieldIdPrefix="add-service-package"
      />
    </ServicePackageDialog>
  )
}
