import { useState } from 'react'
import { useUpdateDevice } from '../hooks/useDeviceMutations'
import { DeviceForm } from './DeviceForm'
import type { Device, DeviceFormValues } from '../devices.types'
import { ApiError } from '@/types/api'

interface Props {
  device: Device
  onClose: () => void
}

export function EditDeviceModal({ device, onClose }: Props) {
  const { mutate, isPending } = useUpdateDevice(device.id)
  const [serverError, setServerError] = useState<string | null>(null)

  const defaultValues: DeviceFormValues = {
    memberId: device.memberId ?? '',
    deviceType: device.deviceType,
    brand: device.brand,
    model: device.model,
    osName: device.osName,
    osVersion: device.osVersion,
    supportStatus: device.supportStatus,
    screenLockEnabled: device.screenLockEnabled,
    biometricEnabled: device.biometricEnabled,
    backupEnabled: device.backupEnabled,
    findMyDeviceEnabled: device.findMyDeviceEnabled,
    notes: device.notes ?? '',
  }

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
      aria-labelledby="edit-device-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl max-h-[90vh]">
        <h2 id="edit-device-title" className="mb-4 text-lg font-semibold text-gray-900">
          Edit device
        </h2>
        <DeviceForm
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
