import { useMutation, useQueryClient } from '@tanstack/react-query'
import { incidentsService } from '../incidents.service'
import { incidentKeys } from './useIncidentQueries'

export function useReportIncident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: incidentsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all })
    },
  })
}
