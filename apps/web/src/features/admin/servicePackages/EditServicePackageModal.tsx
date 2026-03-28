import type { ApiError } from '@/types/api'
import { ServicePackageForm } from './ServicePackageForm'
import { ServicePackageDialog } from './ServicePackageDialog'
import { useUpdateAdminServicePackage } from './adminServicePackages.hooks'
import { toUpdateRequest } from './adminServicePackages.schema'
import type { AdminServicePackage, ServicePackageFormValues } from './adminServicePackages.types'

interface EditServicePackageModalProps {
  open: boolean
  packageItem: AdminServicePackage | null
  onClose: () => void
}

function toInitialValues(packageItem: AdminServicePackage): ServicePackageFormValues {
  return {
    title: packageItem.title,
    code: packageItem.code,
    description: packageItem.description,
    price: String(packageItem.price),
    currency: packageItem.currency,
    durationMinutes: String(packageItem.durationMinutes),
    isVisible: packageItem.isVisible,
  }
}

export function EditServicePackageModal({ open, packageItem, onClose }: EditServicePackageModalProps) {
  const updateMutation = useUpdateAdminServicePackage()

  if (!open || !packageItem) return null
  const currentPackage = packageItem

  function handleSubmit(values: ServicePackageFormValues) {
    updateMutation.mutate(toUpdateRequest(currentPackage.id, values), {
      onSuccess: () => onClose(),
    })
  }

  const errorMessage = updateMutation.isError
    ? (updateMutation.error as ApiError).message
    : undefined

  return (
    <ServicePackageDialog
      open={open}
      title="Edit service package"
      description="Update title, pricing, duration, and visibility."
      errorMessage={errorMessage}
      onClose={onClose}
    >
      <ServicePackageForm
        initialValues={toInitialValues(currentPackage)}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={updateMutation.isPending}
        submitLabel="Save changes"
        fieldIdPrefix={`edit-service-package-${currentPackage.id}`}
      />
    </ServicePackageDialog>
  )
}
