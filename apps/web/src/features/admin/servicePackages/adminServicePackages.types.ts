export interface AdminServicePackageApiResponse {
  id: string
  title: string
  code: string
  description: string
  price: number
  currency: string
  durationMinutes: number
  isActive: boolean
  isVisible: boolean
  priceDisplay: string
  durationLabel: string
  createdAt: string
  updatedAt: string
}

export interface AdminServicePackage {
  id: string
  title: string
  code: string
  description: string
  price: number
  currency: string
  durationMinutes: number
  isActive: boolean
  isVisible: boolean
  priceDisplay: string
  durationLabel: string
  createdAt: string
  updatedAt: string
}

export interface CreateAdminServicePackageRequest {
  title: string
  code: string
  description: string
  price: number
  currency: string
  durationMinutes: number
  isVisible: boolean
}

export interface UpdateAdminServicePackageRequest extends CreateAdminServicePackageRequest {
  id: string
}

export interface UpdateAdminServicePackageStatusRequest {
  isActive: boolean
}

export interface ServicePackageFormValues {
  title: string
  code: string
  description: string
  price: string
  currency: string
  durationMinutes: string
  isVisible: boolean
}
