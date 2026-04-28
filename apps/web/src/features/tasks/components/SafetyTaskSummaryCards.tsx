import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, Flame, CheckCircle2, Zap } from 'lucide-react'
import { fadeUpVariants } from '@/lib/motion'
import type { SafetyTask } from '../safety-tasks.types'

interface SafetyTaskSummaryProps {
  tasks: SafetyTask[]
}

interface StatCardProps {
  icon:       React.ReactNode
  label:      string
  value:      number
  colorClass: string
  index:      number
}

function StatCard({ icon, label, value, colorClass, index }: StatCardProps) {
  return (
    <motion.div
      custom={index}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center gap-4 rounded-2xl bg-white border border-gray-100 shadow-sm px-5 py-4 hover:shadow-md transition-shadow"
    >
      <div className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 tabular-nums leading-none">{value}</p>
        <p className="mt-0.5 text-xs font-medium text-gray-500">{label}</p>
      </div>
    </motion.div>
  )
}

export function SafetyTaskSummaryCards({ tasks }: SafetyTaskSummaryProps) {
  const { t } = useTranslation('tasks')
  const total     = tasks.length
  const completed = tasks.filter((t) => t.status === 'Completed').length
  // Count only actionable (non-completed, non-dismissed) tasks to match backend CriticalRemaining / HighRemaining semantics.
  const active    = tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Dismissed')
  const highPrio  = active.filter((t) => t.priority === 'High').length
  const immediate = active.filter((t) => t.phase === 'Immediate').length

  const stats = [
    {
      icon:       <ShieldCheck className="w-5 h-5 text-blue-600" />,
      label:      t('summary.total'),
      value:      total,
      colorClass: 'bg-blue-50',
    },
    {
      icon:       <Flame className="w-5 h-5 text-red-500" />,
      label:      t('summary.highPriority'),
      value:      highPrio,
      colorClass: 'bg-red-50',
    },
    {
      icon:       <Zap className="w-5 h-5 text-amber-500" />,
      label:      t('summary.actNow'),
      value:      immediate,
      colorClass: 'bg-amber-50',
    },
    {
      icon:       <CheckCircle2 className="w-5 h-5 text-green-600" />,
      label:      t('summary.completed'),
      value:      completed,
      colorClass: 'bg-green-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s, i) => (
        <StatCard key={s.label} {...s} index={i} />
      ))}
    </div>
  )
}
