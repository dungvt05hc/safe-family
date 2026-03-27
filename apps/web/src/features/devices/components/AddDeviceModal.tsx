import { useState } from 'react'
import { useCreateDevice } from '../hooks/useDeviceMutations'
import { useFamilyMembers } from '@/features/families/hooks/useFamilyMembers'
import { DeviceForm } from './DeviceForm'
import type { DeviceFormValues } from '../devices.types'
import { ApiError } from '@/types/api'

interface Props {
  onClose: () => void
}

export function AddDeviceModal({ onClose }: Props) {
  const { data: members = [] } = useFamilyMembers()
  const { mutate, isPending } = useCreateDevice()
  const [serverError, setServerError] = useState<string | null>(null)

  function handleSubmit(values: DeviceFormValues) {
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
      aria-labelledby="add-device-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl max-h-[90vh]">
        <h2 id="add-device-title" className="mb-4 text-lg font-semibold text-gray-900">
          Add device
        </h2>
        <DeviceForm
          members={members}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isPending}
          submitLabel="Add device"
          serverError={serverError}
        />
      </div>
    </div>
  )
}
