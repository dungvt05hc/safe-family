import { apiClient } from '@/lib/api-client'
import type {
  AdminServicePackage,
  AdminServicePackageApiResponse,
  CreateAdminServicePackageRequest,
  UpdateAdminServicePackageRequest,
} from './adminServicePackages.types'

function toAdminServicePackage(model: AdminServicePackageApiResponse): AdminServicePackage {
  return {
    id: model.id,
    title: model.title,
    code: model.code,
    description: model.description,
    price: model.price,
    currency: model.currency,
    durationMinutes: model.durationMinutes,
    isActive: model.isActive,
    isVisible: model.isVisible,
    priceDisplay: model.priceDisplay,
    durationLabel: model.durationLabel,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  }
}

export const adminServicePackagesApi = {
  list: (): Promise<AdminServicePackage[]> =>
    apiClient
      .get<AdminServicePackageApiResponse[]>('/api/admin/service-packages')
      .then((rows) => rows.map(toAdminServicePackage)),

  create: (request: CreateAdminServicePackageRequest): Promise<AdminServicePackage> =>
    apiClient
      .post<AdminServicePackageApiResponse>('/api/admin/service-packages', request)
      .then(toAdminServicePackage),

  update: (request: UpdateAdminServicePackageRequest): Promise<AdminServicePackage> => {
    const { id, ...body } = request
    return apiClient
      .put<AdminServicePackageApiResponse>(`/api/admin/service-packages/${id}`, body)
      .then(toAdminServicePackage)
  },

  updateStatus: (id: string, isActive: boolean): Promise<AdminServicePackage> =>
    apiClient
      .patch<AdminServicePackageApiResponse>(`/api/admin/service-packages/${id}/status`, { isActive })
      .then(toAdminServicePackage),
}
