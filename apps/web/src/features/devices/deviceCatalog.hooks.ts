/**
 * deviceCatalog.hooks.ts
 *
 * TanStack Query hooks for the device catalog dropdowns.
 * Each hook is dependency-aware: downstream hooks are disabled until their
 * parent code is selected, preventing unnecessary requests.
 */
import { useQuery } from '@tanstack/react-query'
import { deviceCatalogApi } from './deviceCatalog.api'
import type { CatalogItem, CatalogModel } from './deviceCatalog.types'
import type { ApiError } from '@/types/api'

// ── Query keys ────────────────────────────────────────────────────────────────

export const CATALOG_DEVICE_TYPES_KEY = ['device-catalog', 'device-types'] as const
export const CATALOG_BRANDS_KEY       = ['device-catalog', 'brands'] as const
export const CATALOG_MODELS_KEY       = ['device-catalog', 'models'] as const
export const CATALOG_OS_FAMILIES_KEY  = ['device-catalog', 'os-families'] as const
export const CATALOG_OS_VERSIONS_KEY  = ['device-catalog', 'os-versions'] as const

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** Fetches all active device types. Always enabled — the first dropdown. */
export function useDeviceTypes() {
  return useQuery<CatalogItem[], ApiError>({
    queryKey: [...CATALOG_DEVICE_TYPES_KEY],
    queryFn: deviceCatalogApi.getDeviceTypes,
  })
}

/** Fetches brands available for a given device type. Disabled until deviceTypeCode is provided. */
export function useBrands(deviceTypeCode: string | undefined) {
  return useQuery<CatalogItem[], ApiError>({
    queryKey: [...CATALOG_BRANDS_KEY, deviceTypeCode],
    queryFn: () => deviceCatalogApi.getBrands(deviceTypeCode!),
    enabled: !!deviceTypeCode,
  })
}

/** Fetches models for a device type + brand pair. Disabled until both codes are provided. */
export function useModels(deviceTypeCode: string | undefined, brandCode: string | undefined) {
  return useQuery<CatalogModel[], ApiError>({
    queryKey: [...CATALOG_MODELS_KEY, deviceTypeCode, brandCode],
    queryFn: () => deviceCatalogApi.getModels(deviceTypeCode!, brandCode!),
    enabled: !!deviceTypeCode && !!brandCode,
  })
}

/** Fetches OS families for a given model. Disabled until modelCode is provided. */
export function useOsFamilies(modelCode: string | undefined) {
  return useQuery<CatalogItem[], ApiError>({
    queryKey: [...CATALOG_OS_FAMILIES_KEY, modelCode],
    queryFn: () => deviceCatalogApi.getOsFamilies(modelCode!),
    enabled: !!modelCode,
  })
}

/** Fetches OS versions for a given OS family. Disabled until osFamilyCode is provided. */
export function useOsVersions(osFamilyCode: string | undefined) {
  return useQuery<CatalogItem[], ApiError>({
    queryKey: [...CATALOG_OS_VERSIONS_KEY, osFamilyCode],
    queryFn: () => deviceCatalogApi.getOsVersions(osFamilyCode!),
    enabled: !!osFamilyCode,
  })
}
