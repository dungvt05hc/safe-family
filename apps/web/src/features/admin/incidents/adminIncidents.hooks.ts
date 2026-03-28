import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { adminIncidentsApi } from './adminIncidents.api'
import type {
  AdminIncidentFiltersState,
  AdminIncidentRow,
  IncidentStatus,
  AddIncidentNoteRequest,
} from './adminIncidents.types'

// ── Query key factory ─────────────────────────────────────────────────────────

export const adminIncidentKeys = {
  all:    ()                                    => ['admin', 'incidents'] as const,
  list:   (filters: AdminIncidentFiltersState)  => ['admin', 'incidents', 'list', filters] as const,
  detail: (id: string)                          => ['admin', 'incidents', 'detail', id] as const,
}

// ── Shared cache-update helper ────────────────────────────────────────────────

function updateIncidentCaches(qc: QueryClient, updated: AdminIncidentRow) {
  qc.invalidateQueries({ queryKey: adminIncidentKeys.all() })
  qc.setQueryData(adminIncidentKeys.detail(updated.id), (prev: unknown) =>
    prev ? { ...(prev as object), ...updated } : prev,
  )
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function useAdminIncidentsList(filters: AdminIncidentFiltersState) {
  return useQuery({
    queryKey: adminIncidentKeys.list(filters),
    queryFn: () => adminIncidentsApi.getIncidents(filters),
    placeholderData: (prev) => prev,
  })
}

export function useAdminIncidentDetail(id: string | null) {
  return useQuery({
    queryKey: adminIncidentKeys.detail(id ?? ''),
    queryFn: () => adminIncidentsApi.getIncidentById(id!),
    enabled: !!id,
    staleTime: 30_000,
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useUpdateIncidentStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: IncidentStatus }) =>
      adminIncidentsApi.updateStatus(id, status),
    onSuccess: (updated) => updateIncidentCaches(qc, updated),
  })
}

export function useAddIncidentNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: AddIncidentNoteRequest }) =>
      adminIncidentsApi.addNote(id, req),
    onSuccess: (_note, { id }) => {
      qc.invalidateQueries({ queryKey: adminIncidentKeys.detail(id) })
    },
  })
}
