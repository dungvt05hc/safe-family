/**
 * deviceCatalog.api.ts
 *
 * API calls for the device catalog feature.
 * Each endpoint returns filtered, sorted catalog items driven by the backend.
 */
import { apiClient } from '@/lib/api-client'
import type { CatalogFormOptions, CatalogItem, CatalogModel } from './deviceCatalog.types'

const BASE = '/api/device-catalog'

export const deviceCatalogApi = {
  /** GET /api/device-catalog/device-types */
  getDeviceTypes: (): Promise<CatalogItem[]> =>
    apiClient.get<CatalogItem[]>(`${BASE}/device-types`),

  /** GET /api/device-catalog/brands?deviceTypeCode=X */
  getBrands: (deviceTypeCode: string): Promise<CatalogItem[]> =>
    apiClient.get<CatalogItem[]>(`${BASE}/brands?deviceTypeCode=${encodeURIComponent(deviceTypeCode)}`),

  /** GET /api/device-catalog/models?deviceTypeCode=X&brandCode=Y */
  getModels: (deviceTypeCode: string, brandCode: string): Promise<CatalogModel[]> =>
    apiClient.get<CatalogModel[]>(
      `${BASE}/models?deviceTypeCode=${encodeURIComponent(deviceTypeCode)}&brandCode=${encodeURIComponent(brandCode)}`,
    ),

  /** GET /api/device-catalog/os-families?modelCode=X */
  getOsFamilies: (modelCode: string): Promise<CatalogItem[]> =>
    apiClient.get<CatalogItem[]>(`${BASE}/os-families?modelCode=${encodeURIComponent(modelCode)}`),

  /** GET /api/device-catalog/os-versions?osFamilyCode=X */
  getOsVersions: (osFamilyCode: string): Promise<CatalogItem[]> =>
    apiClient.get<CatalogItem[]>(`${BASE}/os-versions?osFamilyCode=${encodeURIComponent(osFamilyCode)}`),

  /** GET /api/device-catalog/form-options — all lists in one call */
  getFormOptions: (params?: {
    deviceTypeCode?: string
    brandCode?: string
    modelCode?: string
  }): Promise<CatalogFormOptions> => {
    const qs = new URLSearchParams()
    if (params?.deviceTypeCode) qs.set('deviceTypeCode', params.deviceTypeCode)
    if (params?.brandCode) qs.set('brandCode', params.brandCode)
    if (params?.modelCode) qs.set('modelCode', params.modelCode)
    const query = qs.toString()
    return apiClient.get<CatalogFormOptions>(`${BASE}/form-options${query ? `?${query}` : ''}`)
  },
}
