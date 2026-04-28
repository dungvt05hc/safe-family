import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  RotateCcw,
  PlayCircle,
  XCircle,
  Clock,
  ExternalLink,
  Tag,
  Target,
  Zap,
} from 'lucide-react'
import { fadeUpVariants } from '@/lib/motion'
import { Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  PHASE_COLOR,
  PRIORITY_BADGE,
  STATUS_BADGE,
  type SafetyTask,
} from '../safety-tasks.types'
import { useUpdateSafetyTaskStatus } from '../safety-tasks.hooks'

// ── Types ─────────────────────────────────────────────────────────────────────

interface SafetyTaskCardProps {
  task:  SafetyTask
  index: number
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SafetyTaskCard({ task, index }: SafetyTaskCardProps) {
  const { t } = useTranslation('tasks')
  const { mutate: updateStatus, isPending } = useUpdateSafetyTaskStatus()

  const isDone       = task.status === 'Completed'
  const isDismissed  = task.status === 'Dismissed'
  const isPendingT   = task.status === 'Pending'
  const isInProgress = task.status === 'InProgress'

  const categoryLabel = t(`category.${task.category}`, { defaultValue: task.category })
  const priorityLabel = t(`priority.${task.priority}`, { defaultValue: task.priority })
  const statusLabel   = t(`status.${task.status}`, { defaultValue: task.status })
  const phaseLabel    = t(`phase.${task.phase}`, { defaultValue: task.phase })
  const phaseColor    = PHASE_COLOR[task.phase] ?? 'text-gray-600 bg-gray-100'

  const dueDate    = task.dueAt ? new Date(task.dueAt) : null
  const isOverdue  = dueDate ? dueDate < new Date() && !isDone && !isDismissed : false
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
        isPendingT   && task.priority === 'High' && 'border-red-100',
        isPendingT   && task.priority !== 'High' && 'border-gray-100',
      )}
    >
      {/* Top row — title + badges */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Phase pill */}
            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold', phaseColor)}>
              <Zap className="w-2.5 h-2.5" aria-hidden="true" />
              {phaseLabel}
            </span>
          </div>
          <p
            className={cn(
              'font-semibold text-gray-900 text-sm leading-snug',
              isDone && 'line-through text-gray-500',
            )}
          >
            {task.title}
          </p>
          <p className="mt-1 text-xs text-gray-500 leading-relaxed line-clamp-2">
            {task.description}
          </p>
        </div>

        {/* Priority + status badges */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Badge variant={PRIORITY_BADGE[task.priority]} dot>
            {priorityLabel}
          </Badge>
          <Badge variant={STATUS_BADGE[task.status]}>
            {statusLabel}
          </Badge>
        </div>
      </div>

      {/* Why this matters */}
      {task.whyThisMatters && !isDone && !isDismissed && (
        <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 leading-relaxed">
          {task.whyThisMatters}
        </p>
      )}

      {/* Meta row — category, target, due date, help link */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
          <Tag className="w-3 h-3" aria-hidden="true" />
          {categoryLabel}
        </span>
        {task.targetLabel && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
            <Target className="w-3 h-3" aria-hidden="true" />
            {task.targetLabel}
          </span>
        )}
        {dueDateLabel && (
          <span className={cn(
            'inline-flex items-center gap-1 text-xs',
            isOverdue ? 'text-red-500 font-medium' : 'text-gray-400',
          )}>
            <Clock className="w-3 h-3" aria-hidden="true" />
            {isOverdue ? t('card.overduePrefix') : t('card.duePrefix')}{dueDateLabel}
          </span>
        )}
        {task.helpLink && (
          <a
            href={task.helpLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 hover:underline"
          >
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
            {t('card.guide')}
          </a>
        )}
      </div>

      {/* Action row */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(isPendingT || isInProgress) && (
          <Button
            variant="primary"
            size="sm"
            loading={isPending}
            onClick={() => updateStatus({ id: task.id, status: 'Completed' })}
          >
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            {t('card.markDone')}
          </Button>
        )}

        {isPendingT && (
          <Button
            variant="outline"
            size="sm"
            loading={isPending}
            onClick={() => updateStatus({ id: task.id, status: 'InProgress' })}
          >
            <PlayCircle className="w-3.5 h-3.5" aria-hidden="true" />
            {t('card.start')}
          </Button>
        )}

        {(isDone || isDismissed) && (
          <Button
            variant="outline"
            size="sm"
            loading={isPending}
            onClick={() => updateStatus({ id: task.id, status: 'Pending' })}
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            {t('card.reopen')}
          </Button>
        )}

        {(isPendingT || isInProgress) && (
          <Button
            variant="ghost"
            size="sm"
            loading={isPending}
            onClick={() => updateStatus({ id: task.id, status: 'Dismissed' })}
          >
            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
            {t('card.dismiss')}
          </Button>
        )}
      </div>
    </motion.div>
  )
}
