import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'

interface ServicePackageDialogProps {
  open: boolean
  title: string
  description: string
  errorMessage?: string
  onClose: () => void
  children: ReactNode
}

export function ServicePackageDialog({
  open,
  title,
  description,
  errorMessage,
  onClose,
  children,
}: ServicePackageDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open])

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) {
      onClose()
    }
  }

  function handleCancel(event: React.SyntheticEvent<HTMLDialogElement, Event>) {
    event.preventDefault()
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onCancel={handleCancel}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      <div className="p-5">
        <h2 id={titleId} className="text-lg font-semibold text-gray-900">{title}</h2>
        <p id={descriptionId} className="mt-1 mb-4 text-sm text-gray-500">{description}</p>

        {errorMessage && (
          <p role="alert" className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        {children}
      </div>
    </dialog>
  )
}
