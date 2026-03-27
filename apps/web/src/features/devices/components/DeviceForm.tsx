import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  DEVICE_TYPES,
  DEVICE_TYPE_LABELS,
  SUPPORT_STATUSES,
  SUPPORT_STATUS_LABELS,
  type DeviceFormValues,
} from '../devices.types'
import type { FamilyMember } from '@/features/families/families.types'

const schema = z.object({
  memberId: z.string().optional().default(''),
  deviceType: z.enum(
    ['Smartphone', 'Tablet', 'Laptop', 'Desktop', 'SmartWatch', 'SmartTV', 'GameConsole', 'Other'] as const,
    { errorMap: () => ({ message: 'Select a device type' }) },
  ),
  brand: z.string().min(1, 'Brand is required').max(100, 'Must be 100 characters or fewer'),
  model: z.string().min(1, 'Model is required').max(200, 'Must be 200 characters or fewer'),
  osName: z.string().min(1, 'OS name is required').max(100, 'Must be 100 characters or fewer'),
  osVersion: z.string().min(1, 'OS version is required').max(50, 'Must be 50 characters or fewer'),
  supportStatus: z.enum(
    ['Unknown', 'Supported', 'EndOfLife', 'NoLongerReceivingUpdates'] as const,
  ),
  screenLockEnabled: z.boolean().default(false),
  biometricEnabled: z.boolean().default(false),
  backupEnabled: z.boolean().default(false),
  findMyDeviceEnabled: z.boolean().default(false),
  notes: z.string().max(1000).optional().default(''),
})

interface Props {
  members?: FamilyMember[]
  defaultValues?: Partial<DeviceFormValues>
  onSubmit: (values: DeviceFormValues) => void
  onCancel: () => void
  isSubmitting: boolean
  submitLabel?: string
  serverError?: string | null
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
const selectClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
const labelClass = 'mb-1 block text-sm font-medium text-gray-700'
const errorClass = 'mt-1 text-xs text-red-500'

export function DeviceForm({
  members = [],
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = 'Save',
  serverError,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeviceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      memberId: '',
      deviceType: 'Smartphone',
      brand: '',
      model: '',
      osName: '',
      osVersion: '',
      supportStatus: 'Unknown',
      screenLockEnabled: false,
      biometricEnabled: false,
      backupEnabled: false,
      findMyDeviceEnabled: false,
      notes: '',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {serverError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </p>
      )}

      {/* Member */}
      {members.length > 0 && (
        <div>
          <label htmlFor="memberId" className={labelClass}>
            Family member
          </label>
          <select id="memberId" {...register('memberId')} className={selectClass}>
            <option value="">-- None (shared / unassigned) --</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Device type */}
      <div>
        <label htmlFor="deviceType" className={labelClass}>
          Device type <span className="text-red-500">*</span>
        </label>
        <select id="deviceType" {...register('deviceType')} className={selectClass}>
          {DEVICE_TYPES.map((t) => (
            <option key={t} value={t}>{DEVICE_TYPE_LABELS[t]}</option>
          ))}
        </select>
        {errors.deviceType && <p className={errorClass}>{errors.deviceType.message}</p>}
      </div>

      {/* Brand + Model */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="brand" className={labelClass}>
            Brand <span className="text-red-500">*</span>
          </label>
          <input
            id="brand"
            type="text"
            placeholder="e.g. Apple"
            {...register('brand')}
            className={inputClass}
          />
          {errors.brand && <p className={errorClass}>{errors.brand.message}</p>}
        </div>
        <div>
          <label htmlFor="model" className={labelClass}>
            Model <span className="text-red-500">*</span>
          </label>
          <input
            id="model"
            type="text"
            placeholder="e.g. iPhone 15"
            {...register('model')}
            className={inputClass}
          />
          {errors.model && <p className={errorClass}>{errors.model.message}</p>}
        </div>
      </div>

      {/* OS name + version */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="osName" className={labelClass}>
            OS name <span className="text-red-500">*</span>
          </label>
          <input
            id="osName"
            type="text"
            placeholder="e.g. iOS"
            {...register('osName')}
            className={inputClass}
          />
          {errors.osName && <p className={errorClass}>{errors.osName.message}</p>}
        </div>
        <div>
          <label htmlFor="osVersion" className={labelClass}>
            OS version <span className="text-red-500">*</span>
          </label>
          <input
            id="osVersion"
            type="text"
            placeholder="e.g. 17.4"
            {...register('osVersion')}
            className={inputClass}
          />
          {errors.osVersion && <p className={errorClass}>{errors.osVersion.message}</p>}
        </div>
      </div>

      {/* Support status */}
      <div>
        <label htmlFor="supportStatus" className={labelClass}>
          Support status
        </label>
        <select id="supportStatus" {...register('supportStatus')} className={selectClass}>
          {SUPPORT_STATUSES.map((s) => (
            <option key={s} value={s}>{SUPPORT_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Security checkboxes */}
      <div>
        <p className={labelClass}>Security features</p>
        <div className="space-y-2">
          {(
            [
              { name: 'screenLockEnabled', label: 'Screen lock enabled' },
              { name: 'biometricEnabled', label: 'Biometric authentication enabled' },
              { name: 'backupEnabled', label: 'Backup enabled' },
              { name: 'findMyDeviceEnabled', label: 'Find my device enabled' },
            ] as const
          ).map(({ name, label }) => (
            <label key={name} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                {...register(name)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          {...register('notes')}
          className={inputClass}
          placeholder="Any additional context…"
        />
        {errors.notes && <p className={errorClass}>{errors.notes.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
