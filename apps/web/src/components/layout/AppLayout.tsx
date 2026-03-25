import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AppShell } from './AppShell'
import { pageVariants } from '@/lib/motion'

/**
 * AppLayout — route-level wrapper used in the router config.
 *
 * Each route change triggers a soft fade-up entrance and a fade-up exit
 * via AnimatePresence keyed on the pathname.
 */
export function AppLayout() {
  const location = useLocation()

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </AppShell>
  )
}
