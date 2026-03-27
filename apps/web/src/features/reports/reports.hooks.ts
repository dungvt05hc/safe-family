import { useMutation, useQuery } from '@tanstack/react-query'
import { reportsApi } from './reports.api'
import type { Report, ReportSummary } from './reports.types'

// ── Query keys ────────────────────────────────────────────────────────────────

export const reportKeys = {
  all:     ['reports']                          as const,
  lists:   ['reports', 'list']                 as const,
  detail:  (id: string) => ['reports', id]     as const,
  summary: ['reports', 'summary']              as const,
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Fetches all reports for the authenticated family.
 * Sorted server-side by generatedAt descending.
 */
export function useReports() {
  return useQuery<Report[], Error>({
    queryKey: reportKeys.lists,
    queryFn:  reportsApi.getReports,
    staleTime: 60_000,
  })
}

/**
 * Fetches a single report by ID.
 */
export function useReport(id: string | undefined) {
  return useQuery<Report, Error>({
    queryKey: reportKeys.detail(id ?? ''),
    queryFn:  () => reportsApi.getById(id!),
    enabled:  !!id,
    staleTime: 60_000,
  })
}

/**
 * Fetches aggregate report counts and latest generation date.
 */
export function useReportSummary() {
  return useQuery<ReportSummary, Error>({
    queryKey: reportKeys.summary,
    queryFn:  reportsApi.getSummary,
    staleTime: 60_000,
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Downloads a report. If the report has a file URL, opens it in a new tab.
 * Otherwise, generates a plain-text download from the report body.
 */
export function useDownloadReport() {
  return useMutation<void, Error, Report>({
    mutationFn: (report) => reportsApi.downloadReport(report),
  })
}
