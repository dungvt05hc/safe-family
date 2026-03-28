import { useState } from 'react'
import { StickyNote, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { AdminSpinner, AdminError, AdminEmpty } from '../components/AdminStateViews'
import { useAdminNotesList, useCreateAdminNote } from './adminNotes.hooks'
import type { AdminNoteResponse, CreateAdminNoteRequest, AdminNoteEntityType } from './adminNotes.types'
import { formatNoteDateTime, NOTE_ENTITY_TYPE_COLORS } from './adminNotes.types'

export function AdminNotesPage() {
  const [page, setPage] = useState(1)
  const pageSize = 50
  const { data, isLoading, isError, refetch } = useAdminNotesList({ page, pageSize })

  const notes = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-amber-500" aria-hidden="true" />
            Admin Notes
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Internal notes across families, bookings, and incidents.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          aria-expanded={showForm}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white
                     hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          {showForm ? <X className="w-4 h-4" aria-hidden="true" /> : <Plus className="w-4 h-4" aria-hidden="true" />}
          {showForm ? 'Cancel' : 'New Note'}
        </button>
      </div>

      {/* Inline create form */}
      {showForm && (
        <CreateNoteForm onCreated={() => { setShowForm(false); setPage(1) }} />
      )}

      {/* Notes list */}
      {isLoading && <AdminSpinner />}
      {isError && <AdminError message="Failed to load admin notes." onRetry={refetch} />}

      {!isLoading && !isError && notes.length === 0 && (
        <AdminEmpty
          icon={<StickyNote className="w-10 h-10" />}
          message="No admin notes yet. Click 'New Note' to create one."
        />
      )}

      {notes.length > 0 && (
        <>
          <ul className="space-y-3" role="list" aria-label="Admin notes">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </ul>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {totalPages > 1 ? `Page ${page} of ${totalPages} \u2014 ` : ''}
              {total.toLocaleString()} {total === 1 ? 'note' : 'notes'}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Previous page"
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  Prev
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Next page"
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// \u2500\u2500 Note card \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function NoteCard({ note }: { note: AdminNoteResponse }) {
  return (
    <li className="rounded-lg border bg-white shadow-sm p-4 space-y-2">
      <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
        <span className="font-medium text-gray-600">{note.authorEmail}</span>
        <span aria-hidden="true">\u00b7</span>
        <time dateTime={note.createdAt}>{formatNoteDateTime(note.createdAt)}</time>
        {note.entityType && (
          <>
            <span aria-hidden="true">\u00b7</span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                NOTE_ENTITY_TYPE_COLORS[note.entityType]
              }`}
            >
              {note.entityType}
            </span>
            {note.entityLabel && (
              <span className="text-gray-500 truncate max-w-[200px]" title={note.entityLabel}>
                {note.entityLabel}
              </span>
            )}
          </>
        )}
      </div>
    </li>
  )
}

// \u2500\u2500 Create note form \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function CreateNoteForm({ onCreated }: { onCreated: () => void }) {
  const createNote = useCreateAdminNote()
  const [content, setContent] = useState('')
  const [entityType, setEntityType] = useState<AdminNoteEntityType | ''>('')
  const [entityId, setEntityId] = useState('')

  const trimmedContent = content.trim()
  const trimmedId = entityId.trim()
  const canSubmit = trimmedContent.length > 0 && entityType !== '' && trimmedId.length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    const req: CreateAdminNoteRequest = { content: trimmedContent }
    if (entityType === 'Family') req.familyId = trimmedId
    else if (entityType === 'Booking') req.bookingId = trimmedId
    else if (entityType === 'Incident') req.incidentId = trimmedId

    createNote.mutate(req, {
      onSuccess: () => {
        setContent('')
        setEntityType('')
        setEntityId('')
        onCreated()
      },
    })
  }

  const labelClass = 'block text-xs font-medium text-gray-700 mb-1'
  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200'

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border bg-white p-4 shadow-sm space-y-3"
      aria-label="Create admin note"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="note-entity-type" className={labelClass}>
            Related entity <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <select
            id="note-entity-type"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value as AdminNoteEntityType | '')}
            required
            className={inputClass}
          >
            <option value="">Select type\u2026</option>
            <option value="Family">Family</option>
            <option value="Booking">Booking</option>
            <option value="Incident">Incident</option>
          </select>
        </div>
        <div>
          <label htmlFor="note-entity-id" className={labelClass}>
            Entity ID <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="note-entity-id"
            type="text"
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            placeholder="Paste the entity ID\u2026"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="note-content" className={labelClass}>
          Note content <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <textarea
          id="note-content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            if (createNote.isError) createNote.reset()
          }}
          rows={3}
          maxLength={2000}
          required
          placeholder="Write an internal note\u2026"
          className={`${inputClass} resize-none`}
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400" aria-live="polite">{content.length}/2000</span>
          {content.length > 0 && !trimmedContent && (
            <span className="text-xs text-amber-600" role="status">
              Note cannot be only whitespace.
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {createNote.isError && (
          <p role="alert" className="text-xs text-red-600 mr-auto">
            Failed to create note. Please try again.
          </p>
        )}
        <button
          type="submit"
          disabled={!canSubmit || createNote.isPending}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white
                     hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          {createNote.isPending ? 'Creating\u2026' : 'Create Note'}
        </button>
      </div>
    </form>
  )
}
