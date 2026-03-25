import { motion, AnimatePresence } from 'framer-motion'
import { ListChecks } from 'lucide-react'
import { EmptyState } from '@/components/ui'
import type { ChecklistItem } from '../checklist.types'
import { ChecklistItemCard } from './ChecklistItemCard'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChecklistListProps {
  items:     ChecklistItem[]
  isFiltered: boolean
}

// ── Empty states ──────────────────────────────────────────────────────────────

function NoItems() {
  return (
    <EmptyState
      icon={ListChecks}
      title="Your checklist is clear"
      description="SafeFamily automatically generates tasks from your accounts and devices. Add some and we'll surface the most important actions here."
    />
  )
}

function NoResults() {
  return (
    <EmptyState
      icon={ListChecks}
      title="No matching items"
      description="Try adjusting your filters or search to find what you're looking for."
    />
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * ChecklistList — animated list of ChecklistItemCard components.
 * Shows an appropriate empty state when the list is empty, distinguishing
 * between "no items at all" and "no items matching current filters".
 */
export function ChecklistList({ items, isFiltered }: ChecklistListProps) {
  if (items.length === 0) {
    return isFiltered ? <NoResults /> : <NoItems />
  }

  return (
    <motion.div
      className="flex flex-col gap-3"
      layout
    >
      <AnimatePresence initial={false}>
        {items.map((item, i) => (
          <ChecklistItemCard key={item.id} item={item} index={i} />
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
