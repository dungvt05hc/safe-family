import { motion } from 'framer-motion'
import { AlertTriangle, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { fadeUpVariants } from '@/lib/motion'
import { Badge } from '@/components/ui'
import type { SafetyTask } from '@/features/tasks/safety-tasks.types'
import { PRIORITY_BADGE, PRIORITY_LABEL } from '@/features/tasks/safety-tasks.types'

// ── Text renderer ─────────────────────────────────────────────────────────────

function RiskLine({ text }: { text: string }) {
  const clean = text.replace(/^[-*•]\s*/, '').trim()
  if (!clean) return null
  return (
    <li className="flex items-start gap-2 text-sm text-gray-700">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
      <span>{clean}</span>
    </li>
  )
}

function parseRisks(raw: string): string[] {
  return raw
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
}

// ── Component ─────────────────────────────────────────────────────────────────

interface TopRisksSectionProps {
  topRisks:       string
  immediateTasks: SafetyTask[]
}

export function TopRisksSection({ topRisks, immediateTasks }: TopRisksSectionProps) {
  const { t } = useTranslation('plans')
  const risks = parseRisks(topRisks)

  const criticalTasks = immediateTasks.filter(
    t => t.priority === 'High' && t.status !== 'Completed' && t.status !== 'Dismissed',
  )

  return (
    <motion.section
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      custom={1}
      aria-labelledby="top-risks-heading"
    >
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5 space-y-4">
        {/* Section header */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
            <AlertTriangle className="h-4 w-4 text-red-500" aria-hidden="true" />
          </span>
          <h2 id="top-risks-heading" className="text-base font-semibold text-red-900">
            {t('familySafetyPlan.sections.topRisksHeading')}
          </h2>
        </div>

        {/* Risk list from plan document */}
        {risks.length > 0 && (
          <ul className="space-y-2 pl-1">
            {risks.map((r, i) => (
              <RiskLine key={i} text={r} />
            ))}
          </ul>
        )}

        {risks.length === 0 && (
          <p className="text-sm text-red-600 italic">{t('familySafetyPlan.sections.noRisksListed')}</p>
        )}

        {/* Cross-referenced critical tasks */}
        {criticalTasks.length > 0 && (
          <div className="border-t border-red-200 pt-4 space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-red-600">
              <Shield className="h-3.5 w-3.5" aria-hidden="true" />
              {t('familySafetyPlan.sections.immediateActionsRequired', { count: criticalTasks.length })}
            </p>
            <ul className="space-y-1.5">
              {criticalTasks.slice(0, 5).map(task => (
                <li key={task.id} className="flex items-center justify-between gap-3 rounded-lg bg-white/60 px-3 py-2">
                  <span className="text-sm text-gray-800 truncate">{task.title}</span>
                  <Badge className={`shrink-0 ${PRIORITY_BADGE[task.priority]}`}>
                    {PRIORITY_LABEL[task.priority]}
                  </Badge>
                </li>
              ))}
              {criticalTasks.length > 5 && (
                <li className="text-xs text-red-600 pl-1">
                  {t('familySafetyPlan.sections.moreImmediateActions', { count: criticalTasks.length - 5 })}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </motion.section>
  )
}
