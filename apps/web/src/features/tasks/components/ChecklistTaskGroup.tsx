import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PHASE_COLOR, type SafetyTask, type TaskPhase } from '../safety-tasks.types'
import { ChecklistTaskCard } from './ChecklistTaskCard'

// ── Props ─────────────────────────────────────────────────────────────────────

interface ChecklistTaskGroupProps {
  /** The phase that defines this group's header. */
  phase:  TaskPhase
  tasks:  SafetyTask[]
  /** Mount index — drives entrance stagger delay. */
  index:  number
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ChecklistTaskGroup({ phase, tasks, index }: ChecklistTaskGroupProps) {
  const { t } = useTranslation('tasks')
  const [collapsed, setCollapsed] = useState(false)

  if (tasks.length === 0) return null

  const phaseLabel     = t(`phase.${phase}`, { defaultValue: phase })
  const phaseColor     = PHASE_COLOR[phase] ?? 'text-gray-600 bg-gray-100'
  const completedCount = tasks.filter((t) => t.status === 'Completed').length
  const allDone        = completedCount === tasks.length && tasks.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3, ease: 'easeOut' as const }}
    >
      {/* Group header — collapsible toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-2.5">
          <span className={cn(
            'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
            phaseColor,
          )}>
            {phaseLabel}
          </span>

          <span className="text-xs font-medium text-gray-400">
            {completedCount}/{tasks.length}
          </span>

          {allDone && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              {t('card.allDone')}
            </span>
          )}
        </div>

        <ChevronDown
          className={cn('h-4 w-4 text-gray-400 transition-transform', collapsed && '-rotate-90')}
          aria-hidden="true"
        />
      </button>

      {/* Collapsible task list */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' as const }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 pb-5 pt-2">
              {tasks.map((task, i) => (
                <ChecklistTaskCard key={task.id} task={task} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
