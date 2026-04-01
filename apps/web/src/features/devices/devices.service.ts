import { apiClient } from '@/lib/api-client'
import type { Device, DeviceFilters, DeviceFormValues, DeviceSummary } from './devices.types'

export const devicesService = {
  list: (filters?: DeviceFilters): Promise<Device[]> => {
    const params = new URLSearchParams()
    if (filters?.memberId) params.set('memberId', filters.memberId)
    if (filters?.deviceTypeCode) params.set('deviceTypeCode', filters.deviceTypeCode)
    if (filters?.supportStatus) params.set('supportStatus', filters.supportStatus)
    if (filters?.search) params.set('search', filters.search)
    const qs = params.toString()
    return apiClient.get<Device[]>(`/api/devices${qs ? `?${qs}` : ''}`)
  },

  getById: (id: string): Promise<Device> =>
    apiClient.get<Device>(`/api/devices/${id}`),

  create: (data: DeviceFormValues): Promise<Device> =>
    apiClient.post<Device>('/api/devices', {
      ...data,
      memberId: data.memberId || null,
      notes: data.notes || null,
    }),

  update: (id: string, data: DeviceFormValues): Promise<Device> =>
    apiClient.put<Device>(`/api/devices/${id}`, {
      ...data,
      memberId: data.memberId || null,
      notes: data.notes || null,
    }),

  archive: (id: string): Promise<void> =>
    apiClient.del(`/api/devices/${id}`),

  getSummary: (): Promise<DeviceSummary> =>
    apiClient.get<DeviceSummary>('/api/devices/summary'),
}
