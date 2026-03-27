import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SummaryCardProps {
  label:   string
  value:   number | string
  icon:    LucideIcon
  color:   string   // Tailwind bg + text classes, e.g. 'bg-blue-50 text-blue-600'
  index:   number   // Staggered animation index
}

/**
 * SummaryCard — a compact stat tile used in the dashboard counts row.
 */
export function SummaryCard({ label, value, icon: Icon, color, index }: SummaryCardProps) {
  return (
    <motion.div
      custom={index}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: 'easeOut' }}
      className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={cn('flex items-center justify-center w-11 h-11 rounded-xl shrink-0', color)}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs font-medium text-gray-500 mt-1">{label}</p>
      </div>
    </motion.div>
  )
}
