import { useMutation, useQueryClient } from '@tanstack/react-query'
import { devicesService } from '../devices.service'
import { DEVICES_KEY } from './useDevices'
import type { ApiError } from '@/types/api'
import type { Device, DeviceFormValues } from '../devices.types'

export function useCreateDevice() {
  const queryClient = useQueryClient()
  return useMutation<Device, ApiError, DeviceFormValues>({
    mutationFn: devicesService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEVICES_KEY }),
  })
}

export function useUpdateDevice(id: string) {
  const queryClient = useQueryClient()
  return useMutation<Device, ApiError, DeviceFormValues>({
    mutationFn: (data) => devicesService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEVICES_KEY }),
  })
}

export function useArchiveDevice() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiError, string>({
    mutationFn: devicesService.archive,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEVICES_KEY }),
  })
}
