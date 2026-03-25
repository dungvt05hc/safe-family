import { useMutation, useQuery } from '@tanstack/react-query'
import { reportsApi } from './reports.api'
import type { Report } from './reports.types'

// ── Query keys ────────────────────────────────────────────────────────────────

export const REPORTS_KEY = ['reports'] as const

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Fetches all reports for the authenticated family.
 * Results are sorted by generatedAt descending (newest first).
 */
export function useReports() {
  return useQuery<Report[], Error>({
    queryKey: REPORTS_KEY,
    queryFn:  reportsApi.getReports,
    staleTime: 60_000,
    select: (data) =>
      [...data].sort(
        (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
      ),
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Fetches a report as a Blob and triggers a browser file download.
 * Accepts the report object so we can derive a sensible filename.
 */
export function useDownloadReport() {
  return useMutation<void, Error, Report>({
    mutationFn: async (report) => {
      const blob = await reportsApi.downloadReport(report.id)
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      // Sanitise the title into a safe filename
      const safeName = report.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
      a.download = `${safeName}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  })
}
