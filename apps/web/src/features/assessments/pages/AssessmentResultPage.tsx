import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { useLatestAssessment } from '../hooks/useAssessmentQueries'
import { CATEGORY_LABELS, RISK_LEVEL_CONFIG } from '../assessments.types'
import type { AssessmentResult } from '../assessments.types'

// ── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, riskLevel }: { score: number; riskLevel: AssessmentResult['riskLevel'] }) {
  const config = RISK_LEVEL_CONFIG[riskLevel]
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90" aria-hidden="true">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={
            riskLevel === 'Low'      ? 'stroke-green-500'  :
            riskLevel === 'Medium'   ? 'stroke-amber-500'  :
            riskLevel === 'High'     ? 'stroke-orange-500' :
                                       'stroke-red-500'
          }
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-gray-900">{score}</span>
        <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
      </div>
    </div>
  )
}

// ── Category bar ──────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  accountSecurity: '🔐',
  deviceHygiene:   '💻',
  backupRecovery:  '☁️',
  privacySharing:  '👁️',
  scamReadiness:   '🎣',
}

function CategoryBar({ category, score }: { category: string; score: number }) {
  const label = CATEGORY_LABELS[category] ?? category
  const icon  = CATEGORY_ICONS[category] ?? '📋'
  const color =
    score >= 75 ? 'bg-green-500' :
    score >= 50 ? 'bg-amber-500' :
    score >= 25 ? 'bg-orange-500' :
                  'bg-red-500'

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium text-gray-700">
          <span aria-hidden="true">{icon}</span> {label}
        </span>
        <span className="text-gray-500">{score}/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

// ── Main result page ──────────────────────────────────────────────────────────

export function AssessmentResultPage() {
  const navigate = useNavigate()
  const { data: result, isLoading, isError } = useLatestAssessment()

  if (isLoading) {
    return (
      <PageLayout title="Your Safety Score">
        <p className="text-sm text-gray-500">Loading results…</p>
      </PageLayout>
    )
  }

  if (isError || !result) {
    return (
      <PageLayout title="Your Safety Score">
        <div className="rounded-xl bg-amber-50 px-5 py-8 text-center">
          <p className="text-sm text-amber-700">No assessment found. Take the assessment first.</p>
          <button
            onClick={() => navigate('/assessment')}
            className="mt-4 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Start assessment
          </button>
        </div>
      </PageLayout>
    )
  }

  const riskConfig = RISK_LEVEL_CONFIG[result.riskLevel]
  const assessedAt = new Date(result.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <PageLayout
      title="Your Safety Score"
      description={`Assessed on ${assessedAt}`}
    >
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Overall score card */}
        <div className={`rounded-2xl border ${riskConfig.border} ${riskConfig.bg} px-8 py-8 text-center shadow-sm`}>
          <ScoreRing score={result.overallScore} riskLevel={result.riskLevel} />
          <p className="mt-4 text-sm text-gray-600">
            Your family's digital safety score is{' '}
            <strong className={riskConfig.color}>{result.overallScore}/100</strong>.
          </p>
        </div>

        {/* Category breakdown */}
        <section>
          <h2 className="mb-4 text-base font-bold text-gray-900">Category Breakdown</h2>
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
            <div className="space-y-4">
              {result.categoryScores.map(({ category, score }) => (
                <CategoryBar key={category} category={category} score={score} />
              ))}
            </div>
          </div>
        </section>

        {/* Immediate actions */}
        {result.immediateActions.length > 0 && (
          <section>
            <h2 className="mb-4 text-base font-bold text-gray-900">
              ⚡ Immediate Actions
            </h2>
            <div className="rounded-2xl border border-orange-200 bg-orange-50 px-6 py-5 shadow-sm">
              <ul className="space-y-3">
                {result.immediateActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-800">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-200 text-xs font-bold text-orange-800">
                      {i + 1}
                    </span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* CTA buttons */}
        <section className="rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-sm">
          <h2 className="mb-1 text-base font-bold text-gray-900">What's next?</h2>
          <p className="mb-5 text-sm text-gray-500">
            Improve your score by working through your security checklist or talking to
            an expert.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate('/accounts')}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
            >
              📋 View security checklist
            </button>
            <button
              onClick={() => navigate('/assessment/wizard')}
              className="flex-1 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-center text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              🔄 Retake assessment
            </button>
          </div>
        </section>

      </div>
    </PageLayout>
  )
}
