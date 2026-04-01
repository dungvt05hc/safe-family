import { useState, useCallback } from 'react'
import { useCreateDevice } from '../hooks/useDeviceMutations'
import { useFamilyMembers } from '@/features/families/hooks/useFamilyMembers'
import { DeviceForm } from './DeviceForm'
import type { DeviceFormValues } from '../devices.types'
import { ApiError } from '@/types/api'
import { X } from 'lucide-react'

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
      aria-labelledby="add-device-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 pb-4 pt-5">
          <div>
            <h2 id="add-device-title" className="text-lg font-semibold text-gray-900">
              Add device
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">Register a new device for your family</p>
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
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={isPending}
            submitLabel="Add device"
            serverError={serverError}
          />
        </div>
      </div>
    </div>
  )
}
