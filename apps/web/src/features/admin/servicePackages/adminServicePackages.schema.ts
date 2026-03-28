import { z } from 'zod'
import type {
  CreateAdminServicePackageRequest,
  ServicePackageFormValues,
  UpdateAdminServicePackageRequest,
} from './adminServicePackages.types'

const codeRegex = /^[A-Za-z0-9-]+$/
const currencyRegex = /^[A-Za-z]{3}$/
const priceRegex = /^\d+(\.\d{1,2})?$/
const durationRegex = /^\d+$/

function parsePrice(value: string): number {
  return Number.parseFloat(value.trim())
}

function parseDurationMinutes(value: string): number {
  return Number.parseInt(value.trim(), 10)
}

export const servicePackageFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200, 'Title must be 200 characters or fewer.'),
  code: z.string().trim().min(1, 'Code is required.').max(50, 'Code must be 50 characters or fewer.').regex(codeRegex, 'Code may only contain letters, numbers, and hyphens.'),
  description: z.string().trim().min(1, 'Description is required.').max(1000, 'Description must be 1000 characters or fewer.'),
  price: z.string().trim().min(1, 'Price is required.').regex(priceRegex, 'Price must be a valid number with up to 2 decimal places.').refine((v) => parsePrice(v) >= 0, 'Price must be zero or greater.').refine((v) => parsePrice(v) <= 1000000000, 'Price must be less than or equal to 1000000000.'),
  currency: z.string().trim().toUpperCase().regex(currencyRegex, 'Currency must be a 3-letter code (e.g. USD).'),
  durationMinutes: z.string().trim().min(1, 'Duration is required.').regex(durationRegex, 'Duration must be a whole number.').refine((v) => parseDurationMinutes(v) >= 1 && parseDurationMinutes(v) <= 10080, 'Duration must be between 1 and 10080 minutes.'),
  isVisible: z.boolean(),
})

export type ServicePackageFormErrors = Partial<Record<keyof ServicePackageFormValues, string>>

export function validateServicePackageForm(values: ServicePackageFormValues): ServicePackageFormErrors {
  const parsed = servicePackageFormSchema.safeParse(values)
  if (parsed.success) return {}

  const errors: ServicePackageFormErrors = {}
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof ServicePackageFormValues | undefined
    if (key && !errors[key]) {
      errors[key] = issue.message
    }
  }
  return errors
}

export function toCreateRequest(values: ServicePackageFormValues): CreateAdminServicePackageRequest {
  return {
    title: values.title.trim(),
    code: values.code.trim().toUpperCase(),
    description: values.description.trim(),
    price: parsePrice(values.price),
    currency: values.currency.trim().toUpperCase(),
    durationMinutes: parseDurationMinutes(values.durationMinutes),
    isVisible: values.isVisible,
  }
}

export function toUpdateRequest(id: string, values: ServicePackageFormValues): UpdateAdminServicePackageRequest {
  return {
    id,
    ...toCreateRequest(values),
  }
}
