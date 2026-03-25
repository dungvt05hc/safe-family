import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CreateFamilyFormValues } from '../families.types'
import type { ApiError } from '@/types/api'

const schema = z.object({
  displayName: z
    .string()
    .min(1, 'Family name is required')
    .max(200, 'Family name must be 200 characters or fewer'),
  countryCode: z
    .string()
    .length(2, 'Enter a valid 2-letter country code')
    .toUpperCase(),
  timezone: z
    .string()
    .min(1, 'Timezone is required')
    .max(100, 'Timezone must be 100 characters or fewer'),
})

interface Props {
  onSubmit: (values: CreateFamilyFormValues) => void
  error?: ApiError | null
  isSubmitting: boolean
}

export function FamilyCreateForm({ onSubmit, error, isSubmitting }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFamilyFormValues>({ resolver: zodResolver(schema) })

  const serverMessage =
    error?.isConflict
      ? 'You already belong to a family.'
      : (error?.message ?? null)

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {serverMessage && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverMessage}
        </p>
      )}

      {/* Family name */}
      <div>
        <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium text-gray-700">
          Family name
        </label>
        <input
          id="displayName"
          type="text"
          placeholder="e.g. The Smiths"
          autoFocus
          {...register('displayName')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.displayName && (
          <p className="mt-1 text-xs text-red-500">{errors.displayName.message}</p>
        )}
      </div>

      {/* Country code */}
      <div>
        <label htmlFor="countryCode" className="mb-1.5 block text-sm font-medium text-gray-700">
          Country code
        </label>
        <input
          id="countryCode"
          type="text"
          placeholder="US"
          maxLength={2}
          {...register('countryCode')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">ISO 3166-1 alpha-2 (e.g. US, BR, GB)</p>
        {errors.countryCode && (
          <p className="mt-1 text-xs text-red-500">{errors.countryCode.message}</p>
        )}
      </div>

      {/* Timezone */}
      <div>
        <label htmlFor="timezone" className="mb-1.5 block text-sm font-medium text-gray-700">
          Timezone
        </label>
        <input
          id="timezone"
          type="text"
          placeholder="America/New_York"
          {...register('timezone')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">IANA timezone (e.g. Europe/London)</p>
        {errors.timezone && (
          <p className="mt-1 text-xs text-red-500">{errors.timezone.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isSubmitting ? 'Creating…' : 'Create family'}
      </button>
    </form>
  )
}
