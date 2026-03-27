import { useQuery } from '@tanstack/react-query'
import { devicesService } from '../devices.service'
import type { Device, DeviceFilters } from '../devices.types'
import type { ApiError } from '@/types/api'

export const DEVICES_KEY = ['devices'] as const

export function useDevices(filters?: DeviceFilters) {
  return useQuery<Device[], ApiError>({
    queryKey: [...DEVICES_KEY, filters] as const,
    queryFn: () => devicesService.list(filters),
    retry: false,
  })
}
