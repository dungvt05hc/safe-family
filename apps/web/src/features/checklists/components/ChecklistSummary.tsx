import { motion } from 'framer-motion'
import { ListChecks, Flame, Clock, CheckCircle2 } from 'lucide-react'
import { fadeUpVariants } from '@/lib/motion'
import type { ChecklistItem } from '../checklist.types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChecklistSummaryProps {
  items: ChecklistItem[]
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  colorClass: string
  index: number
}

// ── Stat card ─────────────────────────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * ChecklistSummary — four at-a-glance stat cards shown at the top of the page.
 */
export function ChecklistSummary({ items }: ChecklistSummaryProps) {
  const total     = items.length
  const highPrio  = items.filter((i) => i.priority === 1).length
  const toDo      = items.filter((i) => i.status === 'Pending').length
  const completed = items.filter((i) => i.status === 'Completed').length

  const stats = [
    {
      icon:       <ListChecks className="w-5 h-5 text-blue-600" />,
      label:      'Total tasks',
      value:      total,
      colorClass: 'bg-blue-50',
    },
    {
      icon:       <Flame className="w-5 h-5 text-red-500" />,
      label:      'High priority',
      value:      highPrio,
      colorClass: 'bg-red-50',
    },
    {
      icon:       <Clock className="w-5 h-5 text-amber-500" />,
      label:      'To do',
      value:      toDo,
      colorClass: 'bg-amber-50',
    },
    {
      icon:       <CheckCircle2 className="w-5 h-5 text-green-600" />,
      label:      'Completed',
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
