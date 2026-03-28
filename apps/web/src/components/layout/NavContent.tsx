import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { NAV_GROUPS, type NavGroup } from './nav-items'
import { navItemVariants } from '@/lib/motion'
import { cn } from '@/lib/utils'

// motion(NavLink) preserves the isActive function-className contract while
// adding framer-motion animation support.
const MotionNavLink = motion(NavLink)

interface NavContentProps {
  /** Called when a nav link is activated — used to close the mobile drawer. */
  onItemClick?: () => void
  /**
   * Extra base delay (seconds) before items stagger in.
   * Useful when the nav is inside an animated container, e.g. the mobile drawer.
   */
  itemDelay?: number
  /** Override the default customer nav groups (e.g. for the admin shell). */
  navGroups?: NavGroup[]
}

/**
 * Shared grouped navigation list.
 * Renders NAV_GROUPS with labelled sections and per-item stagger animations.
 * Used by both Sidebar (desktop) and MobileSidebar (mobile drawer).
 */
export function NavContent({ onItemClick, itemDelay = 0, navGroups }: NavContentProps) {
  const groups = navGroups ?? NAV_GROUPS
  // Precompute each group's global stagger-start index so the stagger delay
  // increments continuously across groups rather than resetting to 0 each time.
  const groupsWithOffset = groups.map((group, gi) => ({
    ...group,
    startIdx: groups.slice(0, gi).reduce((sum, g) => sum + g.items.length, 0),
  }))

  return (
    <motion.nav
      className="flex-1 overflow-y-auto py-2 px-2"
      initial="hidden"
      animate="visible"
      transition={itemDelay > 0 ? { delayChildren: itemDelay } : undefined}
    >
      {groupsWithOffset.map((group) => (
        <div key={group.label} className="mb-1">
          {/* Group label */}
          <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500 select-none first:pt-2">
            {group.label}
          </p>

          {/* Nav items */}
          <div className="space-y-0.5">
            {group.items.map((item, i) => (
              <MotionNavLink
                key={item.href}
                to={item.href}
                end={item.href === '/dashboard' || item.href === '/admin'}
                onClick={onItemClick}
                custom={group.startIdx + i}
                variants={navItemVariants}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
                  )
                }
              >
                <item.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                {item.label}
              </MotionNavLink>
            ))}
          </div>
        </div>
      ))}
    </motion.nav>
  )
}
