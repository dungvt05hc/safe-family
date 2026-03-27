import { apiClient } from '@/lib/api-client'
import type { Report, ReportSummary } from './reports.types'

// ── Backend response shapes (match ReportDtos.cs) ─────────────────────────────

interface BackendReportItem {
  id:              string
  reportType:      string
  title:           string
  description:     string
  fileUrl?:        string | null
  generatedAt:     string
  bookingId?:      string | null
  incidentId?:     string | null
  createdByUserId?: string | null
}

interface BackendDownloadInfo {
  fileUrl?:    string | null
  fileName:    string
  contentType: string
}

// ── Mapping ────────────────────────────────────────────────────────────────────

function toReport(r: BackendReportItem): Report {
  return {
    id:          r.id,
    type:        r.reportType as Report['type'],
    title:       r.title,
    description: r.description,
    generatedAt: r.generatedAt,
    downloadUrl: r.fileUrl ?? null,
    body:        r.description,
    bookingId:   r.bookingId,
    incidentId:  r.incidentId,
  }
}

// ── API ────────────────────────────────────────────────────────────────────────

export const reportsApi = {
  /** GET /api/reports — all reports for the authenticated family. */
  getReports(): Promise<Report[]> {
    return apiClient
      .get<BackendReportItem[]>('/api/reports')
      .then((items) => items.map(toReport))
  },

  /** GET /api/reports/:id — single report detail. */
  getById(id: string): Promise<Report> {
    return apiClient
      .get<BackendReportItem>(`/api/reports/${id}`)
      .then(toReport)
  },

  /** GET /api/reports/summary — aggregate counts. */
  getSummary(): Promise<ReportSummary> {
    return apiClient.get<ReportSummary>('/api/reports/summary')
  },

  /**
   * Download a report.
   * - If the report has a `downloadUrl` (FileUrl), opens it in a new tab via
   *   the backend download endpoint (which may return a signed / final URL).
   * - Otherwise generates a plain-text Blob from the report body and triggers
   *   a browser file download.
   */
  async downloadReport(report: Report): Promise<void> {
    if (report.downloadUrl) {
      const info = await apiClient.get<BackendDownloadInfo>(`/api/reports/${report.id}/download`)
      if (info.fileUrl) {
        window.open(info.fileUrl, '_blank', 'noopener,noreferrer')
        return
      }
    }

    // Fallback: plain-text download
    const text = `${report.title}\n\n${report.body}`
    const blob = new Blob([text], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${report.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },
}
