import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ShieldCheck } from 'lucide-react'
import { EmptyState } from '@/components/ui'
import type { SafetyTask } from '../safety-tasks.types'
import { SafetyTaskCard } from './SafetyTaskCard'

interface SafetyTaskListProps {
  tasks:      SafetyTask[]
  isFiltered: boolean
}

function NoTasks() {
  const { t } = useTranslation('tasks')
  return (
    <EmptyState
      icon={ShieldCheck}
      title={t('empty.noTasksTitle')}
      description={t('empty.noTasksDesc')}
    />
  )
}

function NoResults() {
  const { t } = useTranslation('tasks')
  return (
    <EmptyState
      icon={ShieldCheck}
      title={t('empty.noResultsTitle')}
      description={t('empty.noResultsDesc')}
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
