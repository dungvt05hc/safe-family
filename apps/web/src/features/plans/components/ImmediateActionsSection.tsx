import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Zap } from 'lucide-react'
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
        className="mt-0.5 shrink-0 rounded text-gray-300 hover:text-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-40 transition-colors"
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
      </div>

      <Badge className={`shrink-0 text-xs ${PRIORITY_BADGE[task.priority]}`}>
        {PRIORITY_LABEL[task.priority]}
      </Badge>
    </li>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ImmediateActionsSectionProps {
  whatToDoNow: string
  tasks:       SafetyTask[]
}

export function ImmediateActionsSection({ whatToDoNow, tasks }: ImmediateActionsSectionProps) {
  const completedCount = tasks.filter(t => t.status === 'Completed').length

  return (
    <motion.section
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      custom={1}
      aria-labelledby="immediate-actions-heading"
    >
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-4">
        {/* Section header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <Zap className="h-4 w-4 text-amber-600" aria-hidden="true" />
            </span>
            <h2 id="immediate-actions-heading" className="text-base font-semibold text-amber-900">
              What to Do Right Now
            </h2>
          </div>

          {tasks.length > 0 && (
            <span className="text-xs text-amber-600 font-medium">
              {completedCount}/{tasks.length} complete
            </span>
          )}
        </div>

        {/* Narrative */}
        {whatToDoNow.trim() && (
          <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-line">
            {whatToDoNow}
          </p>
        )}

        {/* Tasks */}
        {tasks.length > 0 && (
          <ul className="space-y-2 border-t border-amber-200 pt-4">
            {tasks.map(task => (
              <TaskRow key={task.id} task={task} />
            ))}
          </ul>
        )}
      </div>
    </motion.section>
  )
}
