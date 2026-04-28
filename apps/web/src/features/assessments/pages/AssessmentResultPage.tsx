import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '@/components/layout/PageLayout'
import { useFeatureFlags } from '@/lib/featureFlags'
import { useLatestAssessment } from '../hooks/useAssessmentQueries'
import { RISK_LEVEL_CONFIG } from '../assessments.types'
import type { AssessmentResult } from '../assessments.types'

// ── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, riskLevel }: { score: number; riskLevel: AssessmentResult['riskLevel'] }) {
  const { t } = useTranslation('assessments')
  const config = RISK_LEVEL_CONFIG[riskLevel]
  const label = t(`riskLevels.${riskLevel}`, { defaultValue: config.label })
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
        <span className={`text-xs font-semibold ${config.color}`}>{label}</span>
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
  const { t } = useTranslation('assessments')
  const label = t(`categories.${category}`, { defaultValue: category })
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
  const { t } = useTranslation('assessments')
  const { bookingEnabled } = useFeatureFlags()
  const { data: result, isLoading, isError } = useLatestAssessment()

  if (isLoading) {
    return (
      <PageLayout title={t('result.pageTitle')}>
        <p className="text-sm text-gray-500">{t('result.loadingResults')}</p>
      </PageLayout>
    )
  }

  if (isError || !result) {
    return (
      <PageLayout title={t('result.pageTitle')}>
        <div className="rounded-xl bg-amber-50 px-5 py-8 text-center">
          <p className="text-sm text-amber-700">{t('result.noAssessment')}</p>
          <button
            onClick={() => navigate('/assessment')}
            className="mt-4 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {t('result.startAssessment')}
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
      title={t('result.pageTitle')}
      description={t('result.assessedOn', { date: assessedAt })}
    >
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Overall score card */}
        <div className={`rounded-2xl border ${riskConfig.border} ${riskConfig.bg} px-8 py-8 text-center shadow-sm`}>
          <ScoreRing score={result.overallScore} riskLevel={result.riskLevel} />
          <p className="mt-4 text-sm text-gray-600">
            {t(`result.riskMessage.${result.riskLevel}` as const)}
          </p>
        </div>

        {/* Category breakdown */}
        <section>
          <h2 className="mb-4 text-base font-bold text-gray-900">{t('result.categoryBreakdown')}</h2>
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
              {t('result.immediateActions')}
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
          <h2 className="mb-1 text-base font-bold text-gray-900">{t('result.whatsNext')}</h2>
          <p className="mb-5 text-sm text-gray-500">{t('result.whatsNextDescription')}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate('/checklists')}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
            >
              {t('result.viewChecklist')}
            </button>
            <button
              onClick={() => navigate('/assessment/wizard')}
              className="flex-1 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-center text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              {t('result.retakeAssessment')}
            </button>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            {bookingEnabled && (
              <button
                onClick={() => navigate('/bookings')}
                className="font-medium text-gray-500 hover:text-gray-700 hover:underline"
              >
                {t('result.bookConsultation')}
              </button>
            )}
            <button
              onClick={() => navigate('/assessment/history')}
              className="font-medium text-blue-600 hover:underline"
            >
              {t('result.viewHistory')}
            </button>
          </div>
        </section>

      </div>
    </PageLayout>
  )
}
