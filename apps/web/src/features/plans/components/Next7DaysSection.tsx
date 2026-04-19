import { motion } from 'framer-motion'
import { CalendarDays, CheckCircle2, Circle } from 'lucide-react'
import { fadeUpVariants } from '@/lib/motion'
import { Badge } from '@/components/ui'
import type { SafetyTask } from '@/features/tasks/safety-tasks.types'
import { PRIORITY_BADGE, PRIORITY_LABEL } from '@/features/tasks/safety-tasks.types'
import { useUpdateSafetyTaskStatus } from '@/features/tasks/safety-tasks.hooks'

// ── Task row ──────────────────────────────────────────────────────────────────

function TaskRow({ task }: { task: SafetyTask }) {
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
        className="mt-0.5 shrink-0 rounded text-gray-300 hover:text-teal-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 disabled:opacity-40 transition-colors"
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
          <p className="mt-0.5 text-xs text-gray-400">For: {task.targetLabel}</p>
        )}
      </div>

      <Badge className={`shrink-0 text-xs ${PRIORITY_BADGE[task.priority]}`}>
        {PRIORITY_LABEL[task.priority]}
      </Badge>
    </li>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Next7DaysSectionProps {
  next7Days: string
  tasks:     SafetyTask[]
}

export function Next7DaysSection({ next7Days, tasks }: Next7DaysSectionProps) {
  const completedCount = tasks.filter(t => t.status === 'Completed').length

  return (
    <motion.section
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      custom={4}
      aria-labelledby="next-7d-heading"
    >
      <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-5 space-y-4">
        {/* Section header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100">
              <CalendarDays className="h-4 w-4 text-teal-600" aria-hidden="true" />
            </span>
            <h2 id="next-7d-heading" className="text-base font-semibold text-teal-900">
              Recovery Plan — Next 7 Days
            </h2>
          </div>

          {tasks.length > 0 && (
            <span className="text-xs text-teal-600 font-medium">
              {completedCount}/{tasks.length} complete
            </span>
          )}
        </div>

        {/* Narrative */}
        {next7Days.trim() && (
          <p className="text-sm text-teal-800 leading-relaxed whitespace-pre-line">
            {next7Days}
          </p>
        )}

        {/* Tasks */}
        {tasks.length > 0 && (
          <ul className="space-y-2 border-t border-teal-200 pt-4">
            {tasks.map(task => (
              <TaskRow key={task.id} task={task} />
            ))}
          </ul>
        )}

        {tasks.length === 0 && !next7Days.trim() && (
          <p className="text-sm text-teal-600 italic">
            Your advisor will add recovery steps here after your session.
          </p>
        )}
      </div>
    </motion.section>
  )
}
