import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { AGE_GROUPS, ECOSYSTEM_OPTIONS, RELATIONSHIP_OPTIONS, type FamilyMemberFormValues } from '../families.types'

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
  submitLabel,
  serverError,
}: Props) {
  const { t } = useTranslation('families')

  const schema = useMemo(
    () =>
      z.object({
        displayName: z
          .string()
          .min(1, t('form.nameRequired'))
          .max(200, t('form.nameMax')),
        relationship: z.enum(
          ['self', 'spouse', 'son', 'daughter', 'father', 'mother', 'grandfather', 'grandmother', 'sibling', 'relative', 'caregiver', 'other'] as const,
          { errorMap: () => ({ message: t('form.relationshipRequired') }) },
        ),
        ageGroup: z.enum(['Infant', 'Child', 'Teen', 'Adult', 'Senior'] as const, {
          errorMap: () => ({ message: t('form.ageGroupRequired') }),
        }),
        primaryEcosystem: z.enum(
          ['google', 'apple', 'microsoft', 'android', 'mixed', 'other', ''] as const,
          { errorMap: () => ({ message: t('form.ecosystemRequired') }) },
        ).default(''),
        isPrimaryContact: z.boolean().default(false),
      }),
    [t],
  )

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
          {t('form.name')} <span className="text-red-500">*</span>
        </label>
        <input
          id="displayName"
          type="text"
          placeholder={t('form.namePlaceholder')}
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
          {t('form.relationship')} <span className="text-red-500">*</span>
        </label>
        <select
          id="relationship"
          {...register('relationship')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {RELATIONSHIP_OPTIONS.map(({ value }) => (
            <option key={value} value={value}>
              {t(`relationship.${value}` as const)}
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
          {t('form.ageGroup')} <span className="text-red-500">*</span>
        </label>
        <select
          id="ageGroup"
          {...register('ageGroup')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {AGE_GROUPS.map((g) => (
            <option key={g} value={g}>
              {t(`ageGroup.${g}` as const)}
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
          {t('form.ecosystem')}
        </label>
        <select
          id="primaryEcosystem"
          {...register('primaryEcosystem')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">{t('form.ecosystemPlaceholder')}</option>
          {ECOSYSTEM_OPTIONS.map(({ value }) => (
            <option key={value} value={value}>
              {t(`ecosystem.${value}` as const)}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-400">{t('form.ecosystemHint')}</p>
        {errors.primaryEcosystem && (
          <p className="mt-1 text-xs text-red-500">{errors.primaryEcosystem.message}</p>
        )}
      </div>

      {/* Is primary contact */}
      <div>
        <div className="flex items-center gap-2.5">
          <input
            id="isPrimaryContact"
            type="checkbox"
            {...register('isPrimaryContact')}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isPrimaryContact" className="text-sm font-medium text-gray-700">
            {t('form.isPrimaryContact')}
          </label>
        </div>
        <p className="mt-1 ml-6.5 text-xs text-gray-400">{t('form.isPrimaryContactHint')}</p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          {t('form.cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? t('form.saving') : (submitLabel ?? t('form.save'))}
        </button>
      </div>
    </form>
  )
}
