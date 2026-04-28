import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '@/components/layout/PageLayout'
import { useAssessmentHistory } from '../hooks/useAssessmentQueries'
import { RISK_LEVEL_CONFIG } from '../assessments.types'
import type { AssessmentResult } from '../assessments.types'

// ── Mini score bar ────────────────────────────────────────────────────────────

function MiniBar({ score }: { score: number }) {
  const color =
    score >= 75 ? 'bg-green-500' :
    score >= 50 ? 'bg-amber-500' :
    score >= 25 ? 'bg-orange-500' :
                  'bg-red-500'
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${score}%` }} />
    </div>
  )
}

// ── History card ──────────────────────────────────────────────────────────────

function HistoryCard({
  assessment,
  index,
  isLatest,
}: {
  assessment: AssessmentResult
  index: number
  isLatest: boolean
}) {
  const { t } = useTranslation('assessments')
  const risk = RISK_LEVEL_CONFIG[assessment.riskLevel]
  const riskLabel = t(`riskLevels.${assessment.riskLevel}`, { defaultValue: risk.label })
  const date = new Date(assessment.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className={`rounded-2xl border bg-white px-6 py-5 shadow-sm transition ${isLatest ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-200'}`}>
      {/* Header row */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{date}</span>
            {isLatest && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                {t('history.latestBadge')}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-gray-400">{t('history.assessmentNumber', { number: index + 1 })}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{assessment.overallScore}</p>
            <p className="text-xs text-gray-400">/ 100</p>
          </div>
          <span className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${risk.color} ${risk.bg} border ${risk.border}`}>
            {riskLabel}
          </span>
        </div>
      </div>

      {/* Category score bars */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {assessment.categoryScores.map(({ category, score }) => (
          <div key={category}>
            <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
              <span>{t(`categories.${category}`, { defaultValue: category })}</span>
              <span>{score}</span>
            </div>
            <MiniBar score={score} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function AssessmentHistoryPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('assessments')
  const { data: history, isLoading, isError } = useAssessmentHistory()

  if (isLoading) {
    return (
      <PageLayout title={t('history.pageTitle')}>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      </PageLayout>
    )
  }

  if (isError) {
    return (
      <PageLayout title={t('history.pageTitle')}>
        <div className="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-600">
          {t('history.loadError')}
        </div>
      </PageLayout>
    )
  }

  if (!history || history.length === 0) {
    return (
      <PageLayout title={t('history.pageTitle')}>
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-12 text-center shadow-sm">
          <div className="mb-3 text-4xl">🛡️</div>
          <p className="text-sm font-medium text-gray-700">{t('history.noAssessments')}</p>
          <p className="mt-1 text-xs text-gray-400">{t('history.noAssessmentsHint')}</p>
          <button
            onClick={() => navigate('/assessment')}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {t('history.takeAssessment')}
          </button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={t('history.pageTitle')}
      description={t('history.completedCount', { count: history.length })}
    >
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Actions bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/assessment/result')}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {t('history.viewLatestResult')}
          </button>
          <button
            onClick={() => navigate('/assessment/wizard')}
            className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            {t('history.retakeAssessment')}
          </button>
        </div>

        {/* Score trend summary */}
        {history.length >= 2 && (
          <TrendBanner current={history[0].overallScore} previous={history[1].overallScore} />
        )}

        {/* Cards list */}
        {history.map((assessment, i) => (
          <HistoryCard
            key={assessment.id}
            assessment={assessment}
            index={history.length - 1 - i}
            isLatest={i === 0}
          />
        ))}
      </div>
    </PageLayout>
  )
}

// ── Trend banner ──────────────────────────────────────────────────────────────

function TrendBanner({ current, previous }: { current: number; previous: number }) {
  const { t } = useTranslation('assessments')
  const diff = current - previous
  if (diff === 0) return null

  const improved = diff > 0
  return (
    <div
      className={`rounded-xl border px-5 py-3 text-sm font-medium ${
        improved
          ? 'border-green-200 bg-green-50 text-green-800'
          : 'border-orange-200 bg-orange-50 text-orange-800'
      }`}
    >
      {improved
        ? t('history.trendImproved', { count: Math.abs(diff) })
        : t('history.trendDecreased', { count: Math.abs(diff) })}
    </div>
  )
}
