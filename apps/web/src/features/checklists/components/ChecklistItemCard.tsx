import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  RotateCcw,
  CalendarPlus,
  BookOpen,
  Tag,
  XCircle,
} from 'lucide-react'
import { fadeUpVariants } from '@/lib/motion'
import { Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  CATEGORY_LABEL,
  PRIORITY_BADGE,
  PRIORITY_LABEL,
  STATUS_BADGE,
  STATUS_LABEL,
  type ChecklistItem,
} from '../checklist.types'
import { useUpdateChecklistStatus } from '../checklist.hooks'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChecklistItemCardProps {
  item:  ChecklistItem
  index: number
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * ChecklistItemCard — renders a single checklist item as a polished card.
 *
 * Actions available:
 * - Mark as Done  (Pending → Completed)
 * - Skip          (Pending → Dismissed)
 * - Reopen        (Completed or Dismissed → Pending)
 * - Open guide    (navigates to relevant help; opens /bookings for "Book help")
 */
export function ChecklistItemCard({ item, index }: ChecklistItemCardProps) {
  const navigate = useNavigate()
  const { mutate: updateStatus, isPending } = useUpdateChecklistStatus()

  const isDone      = item.status === 'Completed'
  const isDismissed = item.status === 'Dismissed'
  const isPending_  = item.status === 'Pending'

  const categoryLabel = CATEGORY_LABEL[item.category] ?? item.category
  const priorityLabel = PRIORITY_LABEL[item.priority as 1 | 2 | 3] ?? 'Medium'
  const statusLabel   = STATUS_LABEL[item.status]

  return (
    <motion.div
      custom={index}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      layout
      whileHover={{ y: -1 }}
      transition={{ layout: { duration: 0.2 } }}
      className={cn(
        'rounded-2xl border bg-white shadow-sm px-5 py-4 transition-shadow hover:shadow-md',
        isDone      && 'border-green-100 bg-green-50/30',
        isDismissed && 'border-gray-200 opacity-60',
        isPending_  && 'border-gray-100',
      )}
    >
      {/* Top row — title + badges */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'font-semibold text-gray-900 text-sm leading-snug',
              isDone && 'line-through text-gray-500',
            )}
          >
            {item.title}
          </p>
          <p className="mt-1 text-xs text-gray-500 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Priority + status badges */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Badge variant={PRIORITY_BADGE[item.priority as 1 | 2 | 3]} dot>
            {priorityLabel}
          </Badge>
          <Badge variant={STATUS_BADGE[item.status]}>
            {statusLabel}
          </Badge>
        </div>
      </div>

      {/* Meta row — category */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
          <Tag className="w-3 h-3" aria-hidden="true" />
          {categoryLabel}
        </span>
        {item.sourceId && (
          <span className="text-[10px] text-gray-300 truncate max-w-[180px]" title={item.sourceId}>
            {item.sourceId}
          </span>
        )}
      </div>

      {/* Action row */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {/* Primary action — mark done or reopen */}
        {isPending_ && (
          <Button
            variant="primary"
            size="sm"
            loading={isPending}
            onClick={() => updateStatus({ id: item.id, status: 'Completed' })}
          >
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            Mark done
          </Button>
        )}

        {(isDone || isDismissed) && (
          <Button
            variant="outline"
            size="sm"
            loading={isPending}
            onClick={() => updateStatus({ id: item.id, status: 'Pending' })}
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reopen
          </Button>
        )}

        {/* Skip */}
        {isPending_ && (
          <Button
            variant="ghost"
            size="sm"
            loading={isPending}
            onClick={() => updateStatus({ id: item.id, status: 'Dismissed' })}
          >
            <XCircle className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
            Skip
          </Button>
        )}

        {/* Book help */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/bookings')}
        >
          <CalendarPlus className="w-3.5 h-3.5" aria-hidden="true" />
          Book help
        </Button>

        {/* Open guide — links to the assessment for guidance */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/assessment')}
        >
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          Open guide
        </Button>
      </div>
    </motion.div>
  )
}
