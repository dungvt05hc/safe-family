import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ShieldCheck } from 'lucide-react'
import { NavContent } from './NavContent'
import { type NavGroup } from './nav-items'

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
  navGroups?: NavGroup[]
}

export function MobileSidebar({ open, onClose, navGroups }: MobileSidebarProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-slate-900 text-slate-100 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <span className="text-base font-semibold tracking-tight">SafeFamily</span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close navigation"
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <NavContent onItemClick={onClose} itemDelay={0.18} navGroups={navGroups} />

            {/* Footer */}
            <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-500">
              SafeFamily &copy; {new Date().getFullYear()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
