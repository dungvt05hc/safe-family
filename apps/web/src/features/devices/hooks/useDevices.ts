import { useQuery } from '@tanstack/react-query'
import { devicesService } from '../devices.service'
import type { Device } from '../devices.types'
import type { ApiError } from '@/types/api'

export const DEVICES_KEY = ['devices'] as const

export function useDevices() {
  return useQuery<Device[], ApiError>({
    queryKey: DEVICES_KEY,
    queryFn: devicesService.list,
    retry: false,
  })
}
