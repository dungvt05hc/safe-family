import { useEffect, useRef, useState } from 'react'
import { X, ExternalLink, FileBarChart2, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  INCIDENT_STATUS_COLORS,
  INCIDENT_SEVERITY_COLORS,
  INCIDENT_TYPE_LABELS,
  INCIDENT_STATUS_LABELS,
  REPORT_TYPE_LABELS,
  formatIncidentStatus,
} from '../admin.badges'
import { AdminSpinner, AdminError } from '../components/AdminStateViews'
import { AdminNotesPanel } from '../notes/AdminNotesPanel'
import { useAdminIncidentDetail, useAddIncidentNote } from './adminIncidents.hooks'
import type { IncidentStatus } from './adminIncidents.types'

const STATUSES: IncidentStatus[] = Object.keys(INCIDENT_STATUS_LABELS) as IncidentStatus[]

interface Props {
  incidentId: string | null
  onClose: () => void
  onStatusChange: (id: string, status: IncidentStatus) => void
  isMutating: boolean
}

const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'
const selectClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400'
const btnPrimary =
  'rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400'

export function AdminIncidentDetailDrawer({ incidentId, onClose, onStatusChange, isMutating }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const open = !!incidentId

  const { data: incident, isLoading, isError, refetch } = useAdminIncidentDetail(incidentId)
  const addNote = useAddIncidentNote()

  const [noteContent, setNoteContent] = useState('')

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) {
      if (!el.open) el.showModal()
    } else {
      if (el.open) el.close()
    }
  }, [open])

  useEffect(() => {
    setNoteContent('')
  }, [incidentId])

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) onClose()
  }

  function handleSubmitNote(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = noteContent.trim()
    if (!trimmed || !incident) return
    addNote.mutate(
      { id: incident.id, req: { content: trimmed } },
      { onSuccess: () => setNoteContent('') },
    )
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onClose={onClose}
      aria-modal="true"
      aria-label={incident ? `Incident for ${incident.familyName}` : 'Incident detail'}
      className={cn(
        'fixed inset-y-0 right-0 m-0 h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl',
        'backdrop:bg-black/40',
        'open:flex open:flex-col',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 sticky top-0 bg-white z-10">
        <h2 className="text-lg font-semibold text-gray-900">Incident Detail</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close drawer"
          className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 space-y-6">
        {isLoading ? (
          <AdminSpinner />
        ) : isError ? (
          <AdminError message="Failed to load incident." onRetry={() => refetch()} />
        ) : !incident ? null : (
          <>
            {/* ── Summary card ─────────────────────────────────────────────── */}
            <section aria-labelledby="incident-summary-heading">
              <h3 id="incident-summary-heading" className="sr-only">Incident summary</h3>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer</span>
                  <Link
                    to={`/admin/customers/${incident.familyId}`}
                    className="font-medium text-amber-600 hover:underline inline-flex items-center gap-1"
                  >
                    {incident.familyName}
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="text-gray-800">{INCIDENT_TYPE_LABELS[incident.type] ?? incident.type}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Severity</span>
                  <span
                    className={cn(
                      'inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                      INCIDENT_SEVERITY_COLORS[incident.severity],
                    )}
                  >
                    {incident.severity}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Reported</span>
                  <span className="text-gray-800">
                    {new Date(incident.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Last updated</span>
                  <span className="text-gray-800">
                    {new Date(incident.updatedAt).toLocaleString()}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200 space-y-1">
                  <span className="text-gray-500 block">Summary</span>
                  <p className="text-gray-800">{incident.summary}</p>
                </div>

                {incident.firstActionPlan && (
                  <div className="pt-2 border-t border-gray-200 space-y-1">
                    <span className="text-gray-500 block">First action plan</span>
                    <p className="text-gray-800">{incident.firstActionPlan}</p>
                  </div>
                )}
              </div>
            </section>

            {/* ── Status control ───────────────────────────────────────────── */}
            <section aria-labelledby="incident-status-heading">
              <h3 id="incident-status-heading" className={labelClass}>Status</h3>
              <div className="flex items-center gap-3">
                <label htmlFor="incident-status-select" className="sr-only">Change incident status</label>
                <select
                  id="incident-status-select"
                  value={incident.status}
                  disabled={isMutating}
                  onChange={(e) => onStatusChange(incident.id, e.target.value as IncidentStatus)}
                  className={cn(selectClass, 'max-w-[180px]')}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{formatIncidentStatus(s)}</option>
                  ))}
                </select>
                <span
                  className={cn(
                    'inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                    INCIDENT_STATUS_COLORS[incident.status],
                  )}
                  aria-hidden="true"
                >
                  {formatIncidentStatus(incident.status)}
                </span>
              </div>
            </section>

            {/* ── Related reports ──────────────────────────────────────────── */}
            {incident.relatedReports.length > 0 && (
              <section aria-labelledby="related-reports-heading">
                <h3 id="related-reports-heading" className={labelClass}>
                  Related reports ({incident.relatedReports.length})
                </h3>
                <ul className="space-y-2">
                  {incident.relatedReports.map((r) => (
                    <li
                      key={r.reportId}
                      className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileBarChart2 className="w-4 h-4 shrink-0 text-purple-500" aria-hidden="true" />
                          <span className="font-medium text-gray-800 truncate">{r.title}</span>
                        </div>
                        <span className="shrink-0 text-xs text-gray-400">
                          {REPORT_TYPE_LABELS[r.reportType] ?? r.reportType}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                        <span>{new Date(r.generatedAt).toLocaleDateString()}</span>
                        {r.bookingId && (
                          <Link
                            to={`/admin/bookings`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                            title={`Related booking id: ${r.bookingId}`}
                          >
                            <BookOpen className="w-3 h-3" aria-hidden="true" />
                            Related booking
                          </Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ── Internal notes ───────────────────────────────────────────── */}
            <section aria-labelledby="notes-heading">
              <h3 id="notes-heading" className={labelClass}>
                Internal notes ({incident.notes.length})
              </h3>

              {incident.notes.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No notes yet.</p>
              ) : (
                <ul className="space-y-3">
                  {incident.notes.map((note) => (
                    <li
                      key={note.noteId}
                      className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm"
                    >
                      <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {note.authorEmail} · {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {/* Add note form */}
              <form onSubmit={handleSubmitNote} className="mt-4 space-y-2" aria-label="Add internal note">
                <label htmlFor="note-content" className="sr-only">New internal note</label>
                <textarea
                  id="note-content"
                  rows={3}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Add an internal note…"
                  maxLength={2000}
                  disabled={addNote.isPending}
                  aria-describedby="note-char-counter"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50 resize-none"
                />
                {addNote.isError && (
                  <p role="alert" className="text-xs text-red-600">Failed to save note. Please try again.</p>
                )}
                <div className="flex items-center justify-between">
                  <span id="note-char-counter" className="text-xs text-gray-400" aria-live="polite">
                    {noteContent.length}/2000
                  </span>
                  <button
                    type="submit"
                    disabled={!noteContent.trim() || addNote.isPending}
                    className={btnPrimary}
                  >
                    {addNote.isPending ? 'Saving…' : 'Add note'}
                  </button>
                </div>
              </form>
            </section>

            {/* ── Admin Notes (cross-entity) ───────────────────────────────── */}
            <section className="space-y-3">
              <AdminNotesPanel incidentId={incident.id} title="Admin Notes" limit={10} />
            </section>
          </>
        )}
      </div>
    </dialog>
  )
}
