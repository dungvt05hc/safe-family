import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_LABELS,
  TWO_FACTOR_STATUSES,
  TWO_FACTOR_LABELS,
  RECOVERY_STATUSES,
  RECOVERY_LABELS,
  type AccountFormValues,
} from '../accounts.types'
import type { FamilyMember } from '@/features/families/families.types'

const schema = z.object({
  memberId: z.string().optional().default(''),
  accountType: z.enum([
    'Email', 'SocialMedia', 'Banking', 'Shopping', 'Streaming',
    'Gaming', 'Government', 'Healthcare', 'Insurance', 'Utility', 'Work', 'Other',
  ] as const, { errorMap: () => ({ message: 'Select an account type' }) }),
  maskedIdentifier: z
    .string()
    .min(1, 'Identifier is required')
    .max(255, 'Must be 255 characters or fewer'),
  twoFactorStatus: z.enum(['Unknown', 'Enabled', 'Disabled'] as const),
  recoveryEmailStatus: z.enum(['Unknown', 'Set', 'NotSet'] as const),
  recoveryPhoneStatus: z.enum(['Unknown', 'Set', 'NotSet'] as const),
  suspiciousActivityFlag: z.boolean().default(false),
  notes: z.string().max(1000).optional().default(''),
})

interface Props {
  members: FamilyMember[]
  defaultValues?: Partial<AccountFormValues>
  onSubmit: (values: AccountFormValues) => void
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

export function AccountForm({
  members,
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
  } = useForm<AccountFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      memberId: '',
      accountType: 'Email',
      maskedIdentifier: '',
      twoFactorStatus: 'Unknown',
      recoveryEmailStatus: 'Unknown',
      recoveryPhoneStatus: 'Unknown',
      suspiciousActivityFlag: false,
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
            <option value="">— None (shared / unassigned) —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Account type */}
      <div>
        <label htmlFor="accountType" className={labelClass}>
          Account type <span className="text-red-500">*</span>
        </label>
        <select id="accountType" {...register('accountType')} className={selectClass}>
          {ACCOUNT_TYPES.map((t) => (
            <option key={t} value={t}>
              {ACCOUNT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        {errors.accountType && <p className={errorClass}>{errors.accountType.message}</p>}
      </div>

      {/* Masked identifier */}
      <div>
        <label htmlFor="maskedIdentifier" className={labelClass}>
          Masked identifier <span className="text-red-500">*</span>
        </label>
        <input
          id="maskedIdentifier"
          type="text"
          placeholder="e.g. ****@gmail.com or Chase ****4321"
          {...register('maskedIdentifier')}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-gray-400">
          Do not enter passwords or secrets — only a display-safe label.
        </p>
        {errors.maskedIdentifier && (
          <p className={errorClass}>{errors.maskedIdentifier.message}</p>
        )}
      </div>

      {/* Two-factor status */}
      <div>
        <label htmlFor="twoFactorStatus" className={labelClass}>
          Two-factor authentication
        </label>
        <select id="twoFactorStatus" {...register('twoFactorStatus')} className={selectClass}>
          {TWO_FACTOR_STATUSES.map((s) => (
            <option key={s} value={s}>
              {TWO_FACTOR_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Recovery email status */}
      <div>
        <label htmlFor="recoveryEmailStatus" className={labelClass}>
          Recovery email
        </label>
        <select id="recoveryEmailStatus" {...register('recoveryEmailStatus')} className={selectClass}>
          {RECOVERY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {RECOVERY_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Recovery phone status */}
      <div>
        <label htmlFor="recoveryPhoneStatus" className={labelClass}>
          Recovery phone
        </label>
        <select id="recoveryPhoneStatus" {...register('recoveryPhoneStatus')} className={selectClass}>
          {RECOVERY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {RECOVERY_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Suspicious activity flag */}
      <div className="flex items-center gap-2">
        <input
          id="suspiciousActivityFlag"
          type="checkbox"
          {...register('suspiciousActivityFlag')}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="suspiciousActivityFlag" className="text-sm text-gray-700">
          Flag as suspicious activity
        </label>
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
