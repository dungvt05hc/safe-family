import { useId, useRef, useState } from 'react'
import { useCreateAdminNote } from './adminNotes.hooks'
import type { CreateAdminNoteRequest } from './adminNotes.types'

interface Props {
  /** Pre-fill the entity association. At least one must be provided. */
  familyId?: string
  bookingId?: string
  incidentId?: string
  /** Called after the note is successfully created. */
  onCreated?: () => void
}

export function AddAdminNoteForm({ familyId, bookingId, incidentId, onCreated }: Props) {
  const uid = useId()
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const createNote = useCreateAdminNote()

  const trimmedContent = content.trim()
  const isWhitespaceOnly = content.length > 0 && trimmedContent.length === 0
  const canSubmit = trimmedContent.length > 0 && !createNote.isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    const req: CreateAdminNoteRequest = {
      content: trimmedContent,
      ...(familyId && { familyId }),
      ...(bookingId && { bookingId }),
      ...(incidentId && { incidentId }),
    }

    createNote.mutate(req, {
      onSuccess: () => {
        setContent('')
        textareaRef.current?.focus()
        onCreated?.()
      },
    })
  }

  const textareaId = `${uid}-content`
  const errorId = `${uid}-error`
  const hintId = `${uid}-hint`

  return (
    <form onSubmit={handleSubmit} className="space-y-2" aria-label="Add admin note">
      <label htmlFor={textareaId} className="block text-xs font-medium text-gray-700">
        New admin note
      </label>
      <textarea
        id={textareaId}
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
          if (createNote.isError) createNote.reset()
        }}
        rows={3}
        maxLength={2000}
        placeholder="Write an internal note visible only to admin staff\u2026"
        aria-describedby={createNote.isError ? errorId : isWhitespaceOnly ? hintId : undefined}
        aria-invalid={createNote.isError || isWhitespaceOnly || undefined}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400
                   focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none"
      />
      <div className="flex items-center justify-between">
        {isWhitespaceOnly ? (
          <span id={hintId} className="text-xs text-amber-600" role="status">
            Note cannot be only whitespace.
          </span>
        ) : (
          <span className="text-xs text-gray-400" aria-live="polite">{content.length}/2000</span>
        )}
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-semibold text-white
                     hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          {createNote.isPending ? 'Saving\u2026' : 'Add note'}
        </button>
      </div>
      {createNote.isError && (
        <p id={errorId} role="alert" className="text-xs text-red-600">
          Failed to save note. Please try again.
        </p>
      )}
    </form>
  )
}
