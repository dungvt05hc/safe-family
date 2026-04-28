import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  PlayCircle,
  RotateCcw,
  Tag,
  Target,
  XCircle,
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

// ── Guidance renderer ─────────────────────────────────────────────────────────
// Renders plain-text or simple markdown-like content without a parser library.

function GuidanceContent({ markdown }: { markdown: string }) {
  const lines = markdown.split('\n')

  return (
    <div className="space-y-1.5 text-sm text-gray-700 leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) {
          return (
            <p key={i} className="mt-3 text-xs font-bold uppercase tracking-wide text-gray-500 first:mt-0">
              {line.slice(4)}
            </p>
          )
        }
        if (line.startsWith('## ')) {
          return (
            <p key={i} className="mt-3 text-sm font-semibold text-gray-800 first:mt-0">
              {line.slice(3)}
            </p>
          )
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" aria-hidden="true" />
              <span>{line.slice(2)}</span>
            </div>
          )
        }
        if (/^\d+\.\s/.test(line)) {
          const match = line.match(/^(\d+)\.\s(.*)$/)
          if (match) {
            return (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-xs font-bold text-blue-500">{match[1]}.</span>
                <span>{match[2]}</span>
              </div>
            )
          }
        }
        if (line.trim() === '') return <div key={i} className="h-1" />
        return <p key={i}>{line}</p>
      })}
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ChecklistTaskCardProps {
  task:  SafetyTask
  index: number
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ChecklistTaskCard({ task, index }: ChecklistTaskCardProps) {
  const { t } = useTranslation('tasks')
  const [guidanceOpen, setGuidanceOpen] = useState(false)
  const { mutate: updateStatus, isPending } = useUpdateSafetyTaskStatus()

  const isDone       = task.status === 'Completed'
  const isDismissed  = task.status === 'Dismissed'
  const isPendingT   = task.status === 'Pending'
  const isInProgress = task.status === 'InProgress'

  const categoryLabel = t(`category.${task.category}`, { defaultValue: task.category })
  const priorityLabel = t(`priority.${task.priority}`, { defaultValue: task.priority })
  const statusLabel   = t(`status.${task.status}`, { defaultValue: task.status })
  const phaseLabel    = t(`phase.${task.phase}`, { defaultValue: task.phase })
  const phaseColor    = PHASE_COLOR[task.phase]    ?? 'text-gray-600 bg-gray-100'

  const dueDate      = task.dueAt ? new Date(task.dueAt) : null
  const isOverdue    = dueDate ? dueDate < new Date() && !isDone && !isDismissed : false
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
      transition={{ layout: { duration: 0.2 } }}
      className={cn(
        'rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md',
        isDone       && 'border-green-100 bg-green-50/30',
        isDismissed  && 'border-gray-200 opacity-60',
        isInProgress && 'border-blue-100 bg-blue-50/20',
        isPendingT   && task.priority === 'High' && 'border-red-100',
        isPendingT   && task.priority !== 'High' && 'border-gray-100',
      )}
    >
      {/* Main content */}
      <div className="px-5 py-4">
        {/* Top row — phase pill + priority + status badges */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* Phase pill */}
            <span className={cn(
              'mb-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
              phaseColor,
            )}>
              <Zap className="h-2.5 w-2.5" aria-hidden="true" />
              {phaseLabel}
            </span>

            {/* Title */}
            <p className={cn(
              'text-sm font-semibold leading-snug text-gray-900',
              isDone && 'text-gray-500 line-through',
            )}>
              {task.title}
            </p>

            {/* Description */}
            <p className="mt-1 text-xs leading-relaxed text-gray-500 line-clamp-2">
              {task.description}
            </p>
          </div>

          {/* Priority + status badges */}
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Badge variant={PRIORITY_BADGE[task.priority]} dot>
              {priorityLabel}
            </Badge>
            <Badge variant={STATUS_BADGE[task.status]}>
              {statusLabel}
            </Badge>
          </div>
        </div>

        {/* Why this matters */}
        {task.whyThisMatters && (
          <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
            <p className="text-xs font-semibold text-amber-700">{t('card.whyThisMatters')}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-700">
              {task.whyThisMatters}
            </p>
          </div>
        )}

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
            <Tag className="h-3 w-3" aria-hidden="true" />
            {categoryLabel}
          </span>

          {task.targetLabel && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <Target className="h-3 w-3" aria-hidden="true" />
              {task.targetLabel}
            </span>
          )}

          {dueDateLabel && (
            <span className={cn(
              'inline-flex items-center gap-1 text-xs',
              isOverdue ? 'font-medium text-red-500' : 'text-gray-400',
            )}>
              <Clock className="h-3 w-3" aria-hidden="true" />
              {isOverdue ? t('card.overduePrefix') : t('card.duePrefix')}
              {dueDateLabel}
            </span>
          )}

          {task.helpLink && (
            <a
              href={task.helpLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-500 transition-colors hover:text-blue-700 hover:underline"
            >
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              {t('card.guide')}
            </a>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(isPendingT || isInProgress) && (
            <Button
              variant="primary"
              size="sm"
              loading={isPending}
              onClick={() => updateStatus({ id: task.id, status: 'Completed' })}
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
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
              <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
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
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
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
              <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {t('card.dismiss')}
            </Button>
          )}

          {/* Guidance toggle */}
          {task.guidanceMarkdown && (
            <button
              onClick={() => setGuidanceOpen((v) => !v)}
              aria-expanded={guidanceOpen}
              className={cn(
                'ml-auto inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                guidanceOpen
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  : 'text-gray-500 hover:bg-gray-100',
              )}
            >
              {t('card.stepByStepGuide')}
              <ChevronDown className={cn(
                'h-3 w-3 transition-transform',
                guidanceOpen && 'rotate-180',
              )} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable guidance panel */}
      {task.guidanceMarkdown && (
        <AnimatePresence initial={false}>
          {guidanceOpen && (
            <motion.div
              key="guidance"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' as const }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                  {t('card.howToResolve')}
                </p>
                <GuidanceContent markdown={task.guidanceMarkdown} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  )
}
