import { useState, useCallback } from 'react'

interface UseDisclosureReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

/**
 * Manages a boolean open/close state — useful for modals, drawers, and dropdowns.
 *
 * @example
 * const { isOpen, open, close } = useDisclosure()
 * <button onClick={open}>Open modal</button>
 * {isOpen && <Modal onClose={close} />}
 */
export function useDisclosure(initialState = false): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(initialState)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((s) => !s), [])

  return { isOpen, open, close, toggle }
}
