import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { DashboardRiskSummary, RiskLevel } from '../dashboard.types'

// ── Risk level display config ─────────────────────────────────────────────────

const RISK_CONFIG: Record<RiskLevel, {
  label:  string
  bar:    string
  text:   string
  bg:     string
  border: string
  pct:    number
}> = {
  Low:      { label: 'Low Risk',      bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', pct: 20 },
  Medium:   { label: 'Medium Risk',   bar: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200',   pct: 50 },
  High:     { label: 'High Risk',     bar: 'bg-orange-500',  text: 'text-orange-700',  bg: 'bg-orange-50',   border: 'border-orange-200',  pct: 75 },
  Critical: { label: 'Critical Risk', bar: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200',     pct: 95 },
}

interface RiskScoreCardProps {
  riskSummary: DashboardRiskSummary
}

/**
 * RiskScoreCard — displays the family's overall risk score, level badge, and
 * an animated progress bar. Prompts to run assessment when no data is present.
 */
export function RiskScoreCard({ riskSummary }: RiskScoreCardProps) {
  const navigate = useNavigate()
  const cfg = riskSummary.riskLevel ? RISK_CONFIG[riskSummary.riskLevel] : null
  const hasAssessment = riskSummary.overallScore !== null && cfg !== null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.35, ease: 'easeOut' }}
      className={cn(
        'lg:col-span-2 rounded-2xl border p-5 shadow-sm',
        cfg ? `${cfg.bg} ${cfg.border}` : 'border-gray-100 bg-white',
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Family Risk Score
          </p>
          {hasAssessment ? (
            <p className={cn('text-4xl font-black', cfg!.text)}>
              {riskSummary.overallScore}
              <span className="text-lg font-medium text-gray-400 ml-1">/100</span>
            </p>
          ) : (
            <p className="text-3xl font-bold text-gray-300">—</p>
          )}
        </div>
        <div className={cn(
          'flex items-center justify-center w-10 h-10 rounded-xl',
          cfg ? 'bg-white/50' : 'bg-gray-100',
        )}>
          <TrendingUp className={cn('w-5 h-5', cfg?.text ?? 'text-gray-400')} aria-hidden="true" />
        </div>
      </div>

      {/* Score bar + label */}
      {hasAssessment ? (
        <>
          <div className="w-full h-2 rounded-full bg-black/10 overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${cfg!.pct}%` }}
              transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
              className={cn('h-full rounded-full', cfg!.bar)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className={cn('text-sm font-semibold', cfg!.text)}>{cfg!.label}</span>
            {riskSummary.lastAssessedAt && (
              <span className="text-xs text-gray-500">
                Assessed {new Date(riskSummary.lastAssessedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          <button
            onClick={() => navigate('/assessment')}
            className={cn('mt-3 text-xs font-semibold underline underline-offset-2 transition-opacity hover:opacity-70', cfg!.text)}
          >
            Re-run assessment →
          </button>
        </>
      ) : (
        <div className="mt-2">
          <p className="text-sm text-gray-500 mb-3">
            No assessment yet. Run a risk check to see your score.
          </p>
          <button
            onClick={() => navigate('/assessment')}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Run Risk Check →
          </button>
        </div>
      )}
    </motion.div>
  )
}
