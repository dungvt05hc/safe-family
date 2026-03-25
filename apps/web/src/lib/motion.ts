import type { Variants } from 'framer-motion'

/**
 * Page entrance/exit — used in AppLayout for per-route transitions.
 * Transitions are embedded directly in each variant state so the caller
 * doesn't need to supply a separate `transition` prop.
 */
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.15, ease: 'easeIn' as const },
  },
}

/**
 * Fade-up card stagger — pass `custom={index}` on the motion element.
 * Used on stat cards, list items, and anything that should stack-animate on entry.
 */
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: 'easeOut' as const },
  }),
}

/**
 * Sidebar/MobileSidebar nav item entrance stagger.
 * Pass `custom={index}` on each item and the parent nav should
 * set `initial="hidden" animate="visible"`.
 */
export const navItemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, duration: 0.2, ease: 'easeOut' as const },
  }),
}
