import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, User, Users } from 'lucide-react'
import { fadeUpVariants } from '@/lib/motion'
import type { SafetyTask } from '@/features/tasks/safety-tasks.types'
import { PRIORITY_BADGE, PRIORITY_LABEL } from '@/features/tasks/safety-tasks.types'
import { Badge } from '@/components/ui'
import type { FamilyMember } from '@/features/families/families.types'
import { RELATIONSHIP_LABEL } from '@/features/families/families.types'

// ── Per-member group ──────────────────────────────────────────────────────────

function MemberGroup({
  member,
  tasks,
}: {
  member: FamilyMember | undefined
  tasks:  SafetyTask[]
}) {
  const [open, setOpen] = useState(true)

  const displayName = member?.displayName ?? 'Family Member'
  const subtitle    = member
    ? `${RELATIONSHIP_LABEL[member.relationship] ?? member.relationship} · ${member.ageGroup}`
    : ''

  const completedCount = tasks.filter(t => t.status === 'Completed').length
  const activeCount    = tasks.filter(t => t.status !== 'Dismissed').length

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Group header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100">
            <User className="h-4 w-4 text-indigo-600" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">{displayName}</p>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-500">
            {completedCount}/{activeCount} done
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Task list */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="divide-y divide-gray-100 border-t border-gray-100">
              {tasks.map(task => (
                <li
                  key={task.id}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
                    task.status === 'Completed' ? 'opacity-60' : ''
                  }`}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      task.status === 'Completed'   ? 'bg-green-400' :
                      task.status === 'InProgress'  ? 'bg-blue-400'  :
                      task.status === 'Dismissed'   ? 'bg-gray-300'  :
                      task.priority === 'High'       ? 'bg-red-400'   : 'bg-gray-300'
                    }`}
                    aria-hidden="true"
                  />
                  <span className={`flex-1 truncate ${task.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </span>
                  <Badge className={`shrink-0 text-xs ${PRIORITY_BADGE[task.priority]}`}>
                    {PRIORITY_LABEL[task.priority]}
                  </Badge>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface MemberActionPlanSectionProps {
  actionPlanByMember: string
  memberTasks:        SafetyTask[]
  members:            FamilyMember[]
}

export function MemberActionPlanSection({
  actionPlanByMember,
  memberTasks,
  members,
}: MemberActionPlanSectionProps) {
  // Group tasks by targetId
  const grouped = memberTasks.reduce<Record<string, SafetyTask[]>>((acc, task) => {
    const key = task.targetId ?? 'unknown'
    ;(acc[key] ??= []).push(task)
    return acc
  }, {})

  const groupEntries = Object.entries(grouped)

  return (
    <motion.section
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      custom={3}
      aria-labelledby="member-plan-heading"
    >
      <div className="space-y-4">
        {/* Section header */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
            <Users className="h-4 w-4 text-indigo-600" aria-hidden="true" />
          </span>
          <h2 id="member-plan-heading" className="text-base font-semibold text-gray-900">
            Action Plan by Family Member
          </h2>
        </div>

        {/* Narrative from plan document */}
        {actionPlanByMember.trim() && (
          <p className="text-sm text-gray-600 leading-relaxed px-0.5">
            {actionPlanByMember.split('\n').filter(Boolean).join(' ')}
          </p>
        )}

        {/* Per-member task groups */}
        {groupEntries.length > 0 ? (
          <div className="space-y-3">
            {groupEntries.map(([memberId, tasks]) => {
              const member = members.find(m => m.id === memberId)
              return (
                <MemberGroup key={memberId} member={member} tasks={tasks} />
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No member-specific tasks generated yet.</p>
        )}
      </div>
    </motion.section>
  )
}
