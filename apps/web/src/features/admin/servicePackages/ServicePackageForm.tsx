import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { cn } from '@/lib/utils'
import type { ServicePackageFormValues } from './adminServicePackages.types'
import { validateServicePackageForm } from './adminServicePackages.schema'

export const EMPTY_SERVICE_PACKAGE_FORM: ServicePackageFormValues = {
  title: '',
  code: '',
  description: '',
  price: '',
  currency: 'USD',
  durationMinutes: '60',
  isVisible: true,
}

interface ServicePackageFormProps {
  initialValues?: ServicePackageFormValues
  onSubmit: (values: ServicePackageFormValues) => void
  onCancel: () => void
  isSubmitting: boolean
  submitLabel: string
  fieldIdPrefix?: string
}

export function ServicePackageForm({
  initialValues = EMPTY_SERVICE_PACKAGE_FORM,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
  fieldIdPrefix = 'sp',
}: ServicePackageFormProps) {
  const [values, setValues] = useState<ServicePackageFormValues>(initialValues)
  const [touched, setTouched] = useState<Partial<Record<keyof ServicePackageFormValues, boolean>>>({})

  useEffect(() => {
    setValues(initialValues)
    setTouched({})
  }, [initialValues])

  const errors = useMemo(() => validateServicePackageForm(values), [values])
  const isValid = Object.keys(errors).length === 0

  const firstError =
    touched.title && errors.title ? errors.title :
      touched.code && errors.code ? errors.code :
        touched.description && errors.description ? errors.description :
          touched.price && errors.price ? errors.price :
            touched.currency && errors.currency ? errors.currency :
              touched.durationMinutes && errors.durationMinutes ? errors.durationMinutes : null

  function markTouched(key: keyof ServicePackageFormValues) {
    setTouched((prev) => ({ ...prev, [key]: true }))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched({
      title: true,
      code: true,
      description: true,
      price: true,
      currency: true,
      durationMinutes: true,
      isVisible: true,
    })

    if (!isValid) return
    onSubmit(values)
  }

  function fieldInputProps(key: keyof ServicePackageFormValues) {
    const hasError = !!(touched[key] && errors[key])
    const inputId = `${fieldIdPrefix}-${key}`
    const errorId = `${inputId}-error`
    return {
      id: inputId,
      'aria-invalid': hasError || undefined,
      'aria-describedby': hasError ? errorId : undefined,
      required: key !== 'isVisible',
    }
  }

  return (
    <form className="space-y-4" noValidate onSubmit={submit}>
      <p className="sr-only" aria-live="polite">{firstError ?? ''}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label htmlFor={`${fieldIdPrefix}-title`} className="block text-xs font-medium text-gray-600 mb-1">Title</label>
          <input
            {...fieldInputProps('title')}
            value={values.title}
            onChange={(e) => setValues((prev) => ({ ...prev, title: e.target.value }))}
            onBlur={() => markTouched('title')}
            maxLength={200}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white',
              touched.title && errors.title ? 'border-red-400' : 'border-gray-200',
            )}
          />
          {touched.title && errors.title && <p id={`${fieldIdPrefix}-title-error`} role="alert" className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor={`${fieldIdPrefix}-code`} className="block text-xs font-medium text-gray-600 mb-1">Code</label>
          <input
            {...fieldInputProps('code')}
            value={values.code}
            onChange={(e) => setValues((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
            onBlur={() => markTouched('code')}
            maxLength={50}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white',
              touched.code && errors.code ? 'border-red-400' : 'border-gray-200',
            )}
          />
          {touched.code && errors.code && <p id={`${fieldIdPrefix}-code-error`} role="alert" className="mt-1 text-xs text-red-500">{errors.code}</p>}
        </div>

        <div>
          <label htmlFor={`${fieldIdPrefix}-currency`} className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
          <input
            {...fieldInputProps('currency')}
            value={values.currency}
            onChange={(e) => setValues((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
            onBlur={() => markTouched('currency')}
            maxLength={3}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white',
              touched.currency && errors.currency ? 'border-red-400' : 'border-gray-200',
            )}
          />
          {touched.currency && errors.currency && <p id={`${fieldIdPrefix}-currency-error`} role="alert" className="mt-1 text-xs text-red-500">{errors.currency}</p>}
        </div>

        <div>
          <label htmlFor={`${fieldIdPrefix}-price`} className="block text-xs font-medium text-gray-600 mb-1">Price</label>
          <input
            {...fieldInputProps('price')}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={values.price}
            onChange={(e) => setValues((prev) => ({ ...prev, price: e.target.value }))}
            onBlur={() => markTouched('price')}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white',
              touched.price && errors.price ? 'border-red-400' : 'border-gray-200',
            )}
          />
          {touched.price && errors.price && <p id={`${fieldIdPrefix}-price-error`} role="alert" className="mt-1 text-xs text-red-500">{errors.price}</p>}
        </div>

        <div>
          <label htmlFor={`${fieldIdPrefix}-durationMinutes`} className="block text-xs font-medium text-gray-600 mb-1">Duration (minutes)</label>
          <input
            {...fieldInputProps('durationMinutes')}
            type="number"
            min="1"
            max="10080"
            step="1"
            inputMode="numeric"
            value={values.durationMinutes}
            onChange={(e) => setValues((prev) => ({ ...prev, durationMinutes: e.target.value }))}
            onBlur={() => markTouched('durationMinutes')}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white',
              touched.durationMinutes && errors.durationMinutes ? 'border-red-400' : 'border-gray-200',
            )}
          />
          {touched.durationMinutes && errors.durationMinutes && <p id={`${fieldIdPrefix}-durationMinutes-error`} role="alert" className="mt-1 text-xs text-red-500">{errors.durationMinutes}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${fieldIdPrefix}-description`} className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <textarea
            {...fieldInputProps('description')}
            rows={4}
            value={values.description}
            onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
            onBlur={() => markTouched('description')}
            maxLength={1000}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white resize-none',
              touched.description && errors.description ? 'border-red-400' : 'border-gray-200',
            )}
          />
          {touched.description && errors.description && <p id={`${fieldIdPrefix}-description-error`} role="alert" className="mt-1 text-xs text-red-500">{errors.description}</p>}
        </div>

        <label htmlFor={`${fieldIdPrefix}-isVisible`} className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            id={`${fieldIdPrefix}-isVisible`}
            type="checkbox"
            checked={values.isVisible}
            onChange={(e) => setValues((prev) => ({ ...prev, isVisible: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
          />
          Visible in booking package selection
        </label>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-colors',
            isSubmitting ? 'bg-amber-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600',
          )}
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
