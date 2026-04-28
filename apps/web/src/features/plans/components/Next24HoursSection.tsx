import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { fadeUpVariants } from '@/lib/motion'
import { Badge } from '@/components/ui'
import type { SafetyTask } from '@/features/tasks/safety-tasks.types'
import { PRIORITY_BADGE, PRIORITY_LABEL } from '@/features/tasks/safety-tasks.types'
import { useUpdateSafetyTaskStatus } from '@/features/tasks/safety-tasks.hooks'

// ── Task row ──────────────────────────────────────────────────────────────────

function TaskRow({ task }: { task: SafetyTask }) {
  const { t } = useTranslation('plans')
  const { mutate, isPending } = useUpdateSafetyTaskStatus()

  const isDone      = task.status === 'Completed'
  const isDismissed = task.status === 'Dismissed'

  function toggle() {
    mutate({ id: task.id, status: isDone ? 'Pending' : 'Completed' })
  }

  return (
    <li className={`flex items-start gap-3 rounded-xl px-4 py-3 transition-colors ${
      isDone ? 'bg-green-50 opacity-70' : isDismissed ? 'bg-gray-50 opacity-50' : 'bg-white/80'
    }`}>
      <button
        onClick={toggle}
        disabled={isPending || isDismissed}
        aria-label={isDone ? `Reopen: ${task.title}` : `Mark done: ${task.title}`}
        className="mt-0.5 shrink-0 rounded text-gray-300 hover:text-orange-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 disabled:opacity-40 transition-colors"
      >
        {isDone
          ? <CheckCircle2 className="h-5 w-5 text-green-500" />
          : <Circle className="h-5 w-5" />
        }
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {task.title}
        </p>
        {task.description && !isDone && (
          <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{task.description}</p>
        )}
        {task.targetLabel && (
          <p className="mt-0.5 text-xs text-gray-400">{t('incidentRecovery.sections.forTarget', { target: task.targetLabel })}</p>
        )}
      </div>

      <Badge className={`shrink-0 text-xs ${PRIORITY_BADGE[task.priority]}`}>
        {PRIORITY_LABEL[task.priority]}
      </Badge>
    </li>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Next24HoursSectionProps {
  next24Hours: string
  tasks:       SafetyTask[]
}

export function Next24HoursSection({ next24Hours, tasks }: Next24HoursSectionProps) {
  const { t } = useTranslation('plans')
  const completedCount = tasks.filter(task => task.status === 'Completed').length

  return (
    <motion.section
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      custom={3}
      aria-labelledby="next-24h-heading"
    >
      <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-5 space-y-4">
        {/* Section header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100">
              <Clock className="h-4 w-4 text-orange-600" aria-hidden="true" />
            </span>
            <h2 id="next-24h-heading" className="text-base font-semibold text-orange-900">
              {t('incidentRecovery.sections.next24Hours')}
            </h2>
          </div>

          {tasks.length > 0 && (
            <span className="text-xs text-orange-600 font-medium">
              {t('incidentRecovery.sections.completionCount', { done: completedCount, total: tasks.length })}
            </span>
          )}
        </div>

        {/* Narrative */}
        {next24Hours.trim() && (
          <p className="text-sm text-orange-800 leading-relaxed whitespace-pre-line">
            {next24Hours}
          </p>
        )}

        {/* Tasks */}
        {tasks.length > 0 && (
          <ul className="space-y-2 border-t border-orange-200 pt-4">
            {tasks.map(task => (
              <TaskRow key={task.id} task={task} />
            ))}
          </ul>
        )}
      </div>
    </motion.section>
  )
}
