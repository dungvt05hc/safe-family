import { apiClient } from '@/lib/api-client'
import type { Device, DeviceFormValues } from './devices.types'

export const devicesService = {
  list: (): Promise<Device[]> => apiClient.get<Device[]>('/api/devices'),

  getById: (id: string): Promise<Device> => apiClient.get<Device>(`/api/devices/${id}`),

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
}
