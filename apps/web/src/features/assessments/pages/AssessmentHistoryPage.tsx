import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { useAssessmentHistory } from '../hooks/useAssessmentQueries'
import { RISK_LEVEL_CONFIG, CATEGORY_LABELS } from '../assessments.types'
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
  const risk = RISK_LEVEL_CONFIG[assessment.riskLevel]
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
                Latest
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-gray-400">Assessment #{index + 1}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{assessment.overallScore}</p>
            <p className="text-xs text-gray-400">/ 100</p>
          </div>
          <span className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${risk.color} ${risk.bg} border ${risk.border}`}>
            {risk.label}
          </span>
        </div>
      </div>

      {/* Category score bars */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {assessment.categoryScores.map(({ category, score }) => (
          <div key={category}>
            <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
              <span>{CATEGORY_LABELS[category] ?? category}</span>
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
  const { data: history, isLoading, isError } = useAssessmentHistory()

  if (isLoading) {
    return (
      <PageLayout title="Assessment History">
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
      <PageLayout title="Assessment History">
        <div className="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-600">
          Failed to load history. Please try again.
        </div>
      </PageLayout>
    )
  }

  if (!history || history.length === 0) {
    return (
      <PageLayout title="Assessment History">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-12 text-center shadow-sm">
          <div className="mb-3 text-4xl">🛡️</div>
          <p className="text-sm font-medium text-gray-700">No assessments yet</p>
          <p className="mt-1 text-xs text-gray-400">
            Complete your first digital safety assessment to start tracking your score over time.
          </p>
          <button
            onClick={() => navigate('/assessment')}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Take assessment
          </button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Assessment History"
      description={`${history.length} assessment${history.length !== 1 ? 's' : ''} completed`}
    >
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Actions bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/assessment/result')}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← View latest result
          </button>
          <button
            onClick={() => navigate('/assessment/wizard')}
            className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            Retake assessment
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
      {improved ? '📈' : '📉'}{' '}
      Your score {improved ? 'improved' : 'decreased'} by{' '}
      <strong>{Math.abs(diff)} points</strong> since your last assessment.
      {improved
        ? ' Keep up the great work!'
        : ' Review your immediate actions to get back on track.'}
    </div>
  )
}
