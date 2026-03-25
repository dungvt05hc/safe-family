import { useQuery } from '@tanstack/react-query'
import { incidentsService } from '../incidents.service'

export const incidentKeys = {
  all: ['incidents'] as const,
  detail: (id: string) => ['incidents', id] as const,
}

export function useIncidents() {
  return useQuery({
    queryKey: incidentKeys.all,
    queryFn: () => incidentsService.getAll(),
  })
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: incidentKeys.detail(id),
    queryFn: () => incidentsService.getById(id),
    enabled: !!id,
  })
}
