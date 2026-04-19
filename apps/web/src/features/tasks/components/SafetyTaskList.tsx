import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { EmptyState } from '@/components/ui'
import type { SafetyTask } from '../safety-tasks.types'
import { SafetyTaskCard } from './SafetyTaskCard'

interface SafetyTaskListProps {
  tasks:      SafetyTask[]
  isFiltered: boolean
}

function NoTasks() {
  return (
    <EmptyState
      icon={ShieldCheck}
      title="No safety tasks"
      description="SafeFamily generates tasks from your accounts, devices, and bookings. Connect your accounts and devices to get started."
    />
  )
}

function NoResults() {
  return (
    <EmptyState
      icon={ShieldCheck}
      title="No matching tasks"
      description="Try adjusting your filters or search to find what you're looking for."
    />
  )
}

export function SafetyTaskList({ tasks, isFiltered }: SafetyTaskListProps) {
  if (tasks.length === 0) {
    return isFiltered ? <NoResults /> : <NoTasks />
  }

  return (
    <motion.div className="flex flex-col gap-3" layout>
      <AnimatePresence initial={false}>
        {tasks.map((task, i) => (
          <SafetyTaskCard key={task.id} task={task} index={i} />
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
