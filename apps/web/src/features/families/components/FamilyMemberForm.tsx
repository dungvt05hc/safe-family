import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AGE_GROUPS, RELATIONSHIP_OPTIONS, type FamilyMemberFormValues } from '../families.types'

const schema = z.object({
  displayName: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must be 200 characters or fewer'),
  relationship: z.enum(
    ['self', 'spouse', 'son', 'daughter', 'father', 'mother', 'grandfather', 'grandmother', 'sibling', 'relative', 'caregiver', 'other'] as const,
    { errorMap: () => ({ message: 'Select a relationship' }) },
  ),
  ageGroup: z.enum(['Infant', 'Child', 'Teen', 'Adult', 'Senior'] as const, {
    errorMap: () => ({ message: 'Select an age group' }),
  }),
  primaryEcosystem: z.string().max(100).optional().default(''),
  isPrimaryContact: z.boolean().default(false),
})

interface Props {
  defaultValues?: Partial<FamilyMemberFormValues>
  onSubmit: (values: FamilyMemberFormValues) => void
  onCancel: () => void
  isSubmitting: boolean
  submitLabel?: string
  serverError?: string | null
}

export function FamilyMemberForm({
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
  } = useForm<FamilyMemberFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: '',
      relationship: 'other',
      ageGroup: 'Adult',
      primaryEcosystem: '',
      isPrimaryContact: false,
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

      {/* Display name */}
      <div>
        <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-gray-700">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="displayName"
          type="text"
          {...register('displayName')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.displayName && (
          <p className="mt-1 text-xs text-red-500">{errors.displayName.message}</p>
        )}
      </div>

      {/* Relationship */}
      <div>
        <label htmlFor="relationship" className="mb-1 block text-sm font-medium text-gray-700">
          Relationship <span className="text-red-500">*</span>
        </label>
        <select
          id="relationship"
          {...register('relationship')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {RELATIONSHIP_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.relationship && (
          <p className="mt-1 text-xs text-red-500">{errors.relationship.message}</p>
        )}
      </div>

      {/* Age group */}
      <div>
        <label htmlFor="ageGroup" className="mb-1 block text-sm font-medium text-gray-700">
          Age group <span className="text-red-500">*</span>
        </label>
        <select
          id="ageGroup"
          {...register('ageGroup')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {AGE_GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        {errors.ageGroup && (
          <p className="mt-1 text-xs text-red-500">{errors.ageGroup.message}</p>
        )}
      </div>

      {/* Primary ecosystem */}
      <div>
        <label htmlFor="primaryEcosystem" className="mb-1 block text-sm font-medium text-gray-700">
          Primary ecosystem
        </label>
        <input
          id="primaryEcosystem"
          type="text"
          placeholder="e.g. Apple, Google, Windows"
          {...register('primaryEcosystem')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.primaryEcosystem && (
          <p className="mt-1 text-xs text-red-500">{errors.primaryEcosystem.message}</p>
        )}
      </div>

      {/* Is primary contact */}
      <div className="flex items-center gap-2.5">
        <input
          id="isPrimaryContact"
          type="checkbox"
          {...register('isPrimaryContact')}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isPrimaryContact" className="text-sm font-medium text-gray-700">
          Primary contact
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
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
