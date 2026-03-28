import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminServicePackagesApi } from './adminServicePackages.api'
import type {
  CreateAdminServicePackageRequest,
  UpdateAdminServicePackageRequest,
} from './adminServicePackages.types'

export const adminServicePackageKeys = {
  all: () => ['admin', 'service-packages'] as const,
  list: () => ['admin', 'service-packages', 'list'] as const,
}

export function useAdminServicePackagesList() {
  return useQuery({
    queryKey: adminServicePackageKeys.list(),
    queryFn: adminServicePackagesApi.list,
    staleTime: 30_000,
    retry: 1,
  })
}

export function useCreateAdminServicePackage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateAdminServicePackageRequest) => adminServicePackagesApi.create(request),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminServicePackageKeys.all() }),
  })
}

export function useUpdateAdminServicePackage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (request: UpdateAdminServicePackageRequest) => adminServicePackagesApi.update(request),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminServicePackageKeys.all() }),
  })
}

export function useUpdateAdminServicePackageStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminServicePackagesApi.updateStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminServicePackageKeys.all() }),
  })
}
