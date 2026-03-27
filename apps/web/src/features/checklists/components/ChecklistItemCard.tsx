import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  RotateCcw,
  CalendarPlus,
  BookOpen,
  Tag,
  XCircle,
  Clock,
  ExternalLink,
  PlayCircle,
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

  const isDone       = item.status === 'Completed'
  const isDismissed  = item.status === 'Dismissed'
  const isPending_   = item.status === 'Pending'
  const isInProgress = item.status === 'InProgress'

  const categoryLabel = CATEGORY_LABEL[item.category] ?? item.category
  const priorityLabel = PRIORITY_LABEL[item.priority as 1 | 2 | 3] ?? 'Medium'
  const statusLabel   = STATUS_LABEL[item.status]

  // Due date helpers
  const dueDate = item.dueAt ? new Date(item.dueAt) : null
  const isOverdue = dueDate ? dueDate < new Date() && !isDone && !isDismissed : false
  const dueDateLabel = dueDate
    ? dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null

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
        isDone       && 'border-green-100 bg-green-50/30',
        isDismissed  && 'border-gray-200 opacity-60',
        isInProgress && 'border-blue-100 bg-blue-50/20',
        isPending_   && 'border-gray-100',
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

      {/* Meta row — category, due date */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
          <Tag className="w-3 h-3" aria-hidden="true" />
          {categoryLabel}
        </span>
        {dueDateLabel && (
          <span className={cn(
            'inline-flex items-center gap-1 text-xs',
            isOverdue ? 'text-red-500 font-medium' : 'text-gray-400',
          )}>
            <Clock className="w-3 h-3" aria-hidden="true" />
            {isOverdue ? 'Overdue · ' : 'Due · '}{dueDateLabel}
          </span>
        )}
        {item.helpUrl && (
          <a
            href={item.helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 hover:underline"
          >
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
            Guide
          </a>
        )}
      </div>

      {/* Action row */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {/* Mark done */}
        {(isPending_ || isInProgress) && (
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

        {/* Start / mark in progress */}
        {isPending_ && (
          <Button
            variant="outline"
            size="sm"
            loading={isPending}
            onClick={() => updateStatus({ id: item.id, status: 'InProgress' })}
          >
            <PlayCircle className="w-3.5 h-3.5" aria-hidden="true" />
            Start
          </Button>
        )}

        {/* Reopen */}
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
        {(isPending_ || isInProgress) && (
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

        {/* Open guide */}
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
