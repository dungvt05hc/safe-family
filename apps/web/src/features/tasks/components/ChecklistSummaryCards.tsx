import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Activity, CheckCircle2, Flame, ShieldCheck, Zap } from 'lucide-react'
import { fadeUpVariants } from '@/lib/motion'
import { useSafetyTaskSummary } from '../safety-tasks.hooks'

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0
  return (
    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      <motion.div
        className="h-full rounded-full bg-green-500"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' as const }}
      />
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-100" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-10 rounded bg-gray-100" />
          <div className="h-3 w-20 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon:       React.ReactNode
  label:      string
  value:      number
  sub?:       string
  colorClass: string
  index:      number
  children?:  React.ReactNode
}

function StatCard({ icon, label, value, sub, colorClass, index, children }: StatCardProps) {
  return (
    <motion.div
      custom={index}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-bold leading-none tabular-nums text-gray-900">{value}</p>
          <p className="mt-0.5 text-xs font-medium leading-tight text-gray-500">{label}</p>
          {sub && <p className="mt-0.5 text-[10px] text-gray-400">{sub}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ChecklistSummaryCards() {
  const { t } = useTranslation('tasks')
  const { data, isLoading } = useSafetyTaskSummary()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (!data) return null

  const { totalTasks, completedTasks, criticalRemaining, highRemaining, tasksInProgress } = data
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <StatCard
        index={0}
        icon={<ShieldCheck className="h-5 w-5 text-blue-600" />}
        label={t('summary.total')}
        value={totalTasks}
        colorClass="bg-blue-50"
        sub={t('summary.completePct', { pct })}
      >
        <ProgressBar value={completedTasks} max={totalTasks} />
      </StatCard>

      <StatCard
        index={1}
        icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
        label={t('summary.completed')}
        value={completedTasks}
        colorClass="bg-green-50"
      />

      <StatCard
        index={2}
        icon={<Zap className="h-5 w-5 text-red-500" />}
        label={t('summary.actNow')}
        value={criticalRemaining}
        colorClass="bg-red-50"
        sub={t('summary.actNowSub')}
      />

      <StatCard
        index={3}
        icon={<Flame className="h-5 w-5 text-amber-500" />}
        label={t('summary.highPriority')}
        value={highRemaining}
        colorClass="bg-amber-50"
        sub={t('summary.highPrioritySub')}
      />

      <StatCard
        index={4}
        icon={<Activity className="h-5 w-5 text-violet-600" />}
        label={t('summary.inProgress')}
        value={tasksInProgress}
        colorClass="bg-violet-50"
      />
    </div>
  )
}
