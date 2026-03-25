import { useMutation, useQueryClient } from '@tanstack/react-query'
import { devicesService } from '../devices.service'
import { DEVICES_KEY } from './useDevices'
import type { DeviceFormValues } from '../devices.types'

export function useCreateDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: DeviceFormValues) => devicesService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEVICES_KEY }),
  })
}

export function useUpdateDevice(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: DeviceFormValues) => devicesService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEVICES_KEY }),
  })
}
