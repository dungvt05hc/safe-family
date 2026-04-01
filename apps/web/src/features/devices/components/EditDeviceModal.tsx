import { useState, useCallback } from 'react'
import { useUpdateDevice } from '../hooks/useDeviceMutations'
import { useFamilyMembers } from '@/features/families/hooks/useFamilyMembers'
import { DeviceForm } from './DeviceForm'
import type { Device, DeviceFormValues } from '../devices.types'
import { ApiError } from '@/types/api'
import { X } from 'lucide-react'

interface Props {
  device: Device
  onClose: () => void
}

export function EditDeviceModal({ device, onClose }: Props) {
  const { data: members = [] } = useFamilyMembers()
  const { mutate, isPending } = useUpdateDevice(device.id)
  const [serverError, setServerError] = useState<string | null>(null)

  const defaultValues: DeviceFormValues = {
    memberId: device.memberId ?? '',
    deviceTypeCode: device.deviceTypeCode,
    brandCode: device.brandCode,
    modelCode: device.modelCode,
    osFamilyCode: device.osFamilyCode,
    osVersionCode: device.osVersionCode,
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

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose],
  )

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-device-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 pb-4 pt-5">
          <div>
            <h2 id="edit-device-title" className="text-lg font-semibold text-gray-900">
              Edit device
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {device.brandName} {device.modelName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <DeviceForm
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
    </div>
  )
}
