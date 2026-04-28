import { motion, AnimatePresence } from 'framer-motion'
import { ListChecks } from 'lucide-react'
import { EmptyState } from '@/components/ui'
import type { ChecklistItem } from '../checklist.types'
import { useTranslation } from 'react-i18next'
import { ChecklistItemCard } from './ChecklistItemCard'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChecklistListProps {
  items:     ChecklistItem[]
  isFiltered: boolean
}

// ── Empty states ──────────────────────────────────────────────────────────────

function NoItems() {
  const { t } = useTranslation('checklist')
  return (
    <EmptyState
      icon={ListChecks}
      title={t('empty.noItemsTitle')}
      description={t('empty.noItemsDesc')}
    />
  )
}

function NoResults() {
  const { t } = useTranslation('checklist')
  return (
    <EmptyState
      icon={ListChecks}
      title={t('empty.noResultsTitle')}
      description={t('empty.noResultsDesc')}
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
