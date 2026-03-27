import { useMutation, useQueryClient } from '@tanstack/react-query'
import { incidentsService } from '../incidents.service'
import { incidentKeys } from './useIncidentQueries'
import type { IncidentStatus } from '../incidents.types'

export function useReportIncident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: incidentsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all })
    },
  })
}

export function useUpdateIncidentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: IncidentStatus }) =>
      incidentsService.updateStatus(id, { status }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all })
      queryClient.setQueryData(incidentKeys.detail(updated.id), updated)
    },
  })
}
