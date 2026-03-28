import { useId } from 'react'
import { StickyNote } from 'lucide-react'
import { AdminSpinner, AdminError, AdminEmpty } from '../components/AdminStateViews'
import { useAdminNotesList } from './adminNotes.hooks'
import { AddAdminNoteForm } from './AddAdminNoteForm'
import type { AdminNoteResponse } from './adminNotes.types'
import { formatNoteDateTime } from './adminNotes.types'

interface Props {
  /** Filter to show notes for a specific entity. At least one should be set. */
  familyId?: string
  bookingId?: string
  incidentId?: string
  /** Maximum notes to show (default 20). */
  limit?: number
  /** Section title override. */
  title?: string
}

export function AdminNotesPanel({
  familyId,
  bookingId,
  incidentId,
  limit = 20,
  title = 'Admin Notes',
}: Props) {
  const { data, isLoading, isError, refetch } = useAdminNotesList({
    familyId,
    bookingId,
    incidentId,
    page: 1,
    pageSize: limit,
  })

  const notes = data?.items ?? []
  const total = data?.total ?? 0

  const headingId = useId()

  return (
    <section className="space-y-4" aria-labelledby={headingId}>
      <h3 id={headingId} className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <StickyNote className="w-4 h-4 text-gray-400" aria-hidden="true" />
        {title}
        {data && <span className="text-xs font-normal text-gray-400">({total})</span>}
      </h3>

      <AddAdminNoteForm
        familyId={familyId}
        bookingId={bookingId}
        incidentId={incidentId}
      />

      {isLoading && <AdminSpinner />}
      {isError && <AdminError message="Failed to load notes." onRetry={refetch} />}

      {!isLoading && !isError && notes.length === 0 && (
        <AdminEmpty message="No admin notes yet." />
      )}

      {notes.length > 0 && (
        <NotesList notes={notes} />
      )}
    </section>
  )
}

function NotesList({ notes }: { notes: AdminNoteResponse[] }) {
  return (
    <ul className="space-y-3" aria-label="Admin notes">
      {notes.map((note) => (
        <li key={note.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-1">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{note.authorEmail}</span>
            <span aria-hidden="true">&middot;</span>
            <time dateTime={note.createdAt}>{formatNoteDateTime(note.createdAt)}</time>
            {note.entityType && note.entityLabel && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-gray-500 text-[10px] font-medium">
                  {note.entityType}: {note.entityLabel}
                </span>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
