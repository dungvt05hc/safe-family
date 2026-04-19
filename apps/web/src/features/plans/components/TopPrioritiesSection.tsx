import { motion } from 'framer-motion'
import { CheckCircle2, Circle, ListChecks } from 'lucide-react'
import { fadeUpVariants } from '@/lib/motion'
import { Badge } from '@/components/ui'
import type { SafetyTask } from '@/features/tasks/safety-tasks.types'
import {
  PRIORITY_BADGE,
  PRIORITY_LABEL,
  STATUS_LABEL,
} from '@/features/tasks/safety-tasks.types'
import { useUpdateSafetyTaskStatus } from '@/features/tasks/safety-tasks.hooks'

// ── Text renderer ─────────────────────────────────────────────────────────────

function PriorityLine({ text }: { text: string }) {
  const clean = text.replace(/^[-*•]\s*/, '').trim()
  if (!clean) return null
  return (
    <li className="flex items-start gap-2 text-sm text-gray-700">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" aria-hidden="true" />
      <span>{clean}</span>
    </li>
  )
}

function parsePriorities(raw: string): string[] {
  return raw
    .split('\n')
    .map(l => l.replace(/^[-*•\d.]\s*/, '').trim())
    .filter(Boolean)
}

// ── Mini task row ─────────────────────────────────────────────────────────────

function MiniTaskRow({ task }: { task: SafetyTask }) {
  const { mutate, isPending } = useUpdateSafetyTaskStatus()

  const isDone      = task.status === 'Completed'
  const isDismissed = task.status === 'Dismissed'

  function handleToggle() {
    if (isDone) {
      mutate({ id: task.id, status: 'Pending' })
    } else {
      mutate({ id: task.id, status: 'Completed' })
    }
  }

  return (
    <li
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
        isDone ? 'bg-green-50 opacity-70' : isDismissed ? 'bg-gray-50 opacity-60' : 'bg-white/70'
      }`}
    >
      <button
        onClick={handleToggle}
        disabled={isPending || isDismissed}
        aria-label={isDone ? `Reopen ${task.title}` : `Mark ${task.title} done`}
        className="shrink-0 rounded text-gray-400 hover:text-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-40"
      >
        {isDone ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>

      <span className={`flex-1 text-sm truncate ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
        {task.title}
      </span>

      <Badge className={`shrink-0 text-xs ${PRIORITY_BADGE[task.priority]}`}>
        {PRIORITY_LABEL[task.priority]}
      </Badge>

      {isDismissed && (
        <span className="text-xs text-gray-400 shrink-0">{STATUS_LABEL['Dismissed']}</span>
      )}
    </li>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface TopPrioritiesSectionProps {
  topPriorities: string
  highTasks:     SafetyTask[]
}

export function TopPrioritiesSection({ topPriorities, highTasks }: TopPrioritiesSectionProps) {
  const priorities = parsePriorities(topPriorities)

  const activeTasks = highTasks
    .filter(t => t.status !== 'Dismissed')
    .slice(0, 5)

  return (
    <motion.section
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      custom={2}
      aria-labelledby="top-priorities-heading"
    >
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 space-y-4">
        {/* Section header */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <ListChecks className="h-4 w-4 text-blue-600" aria-hidden="true" />
          </span>
          <h2 id="top-priorities-heading" className="text-base font-semibold text-blue-900">
            Top Priorities
          </h2>
        </div>

        {/* Priority narrative from plan document */}
        {priorities.length > 0 && (
          <ul className="space-y-1.5 pl-1">
            {priorities.map((p, i) => (
              <PriorityLine key={i} text={p} />
            ))}
          </ul>
        )}

        {/* Recommended tasks */}
        {activeTasks.length > 0 && (
          <div className="border-t border-blue-200 pt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Recommended tasks
            </p>
            <ul className="space-y-1.5">
              {activeTasks.map(task => (
                <MiniTaskRow key={task.id} task={task} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.section>
  )
}
