import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '@/components/layout/PageLayout'
import { useLatestAssessment } from '../hooks/useAssessmentQueries'

const CATEGORY_ICONS: [string, string][] = [
  ['🔐', 'accountSecurity'],
  ['💻', 'deviceHygiene'],
  ['☁️', 'backupRecovery'],
  ['👁️', 'privacySharing'],
  ['🎣', 'scamReadiness'],
]

export function AssessmentStartPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('assessments')
  const { data: latest, isLoading } = useLatestAssessment()

  return (
    <PageLayout
      title={t('start.pageTitle')}
      description={t('start.pageDescription')}
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Hero card */}
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 px-8 py-10 text-center shadow-sm">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
            🛡️
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">{t('start.heroTitle')}</h2>
          <p className="text-sm leading-relaxed text-gray-600">{t('start.heroBody')}</p>
          <p className="mt-2 text-xs text-gray-400">{t('start.heroDuration')}</p>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORY_ICONS.map(([icon, key]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm"
            >
              <span>{icon}</span> {t(`categories.${key}`)}
            </span>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => navigate('/assessment/wizard')}
            className="w-full max-w-xs rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t('start.startButton')}
          </button>

          {!isLoading && latest && (
            <button
              onClick={() => navigate('/assessment/result')}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              {t('start.viewLastResult')}
            </button>
          )}
        </div>

        {/* What you'll get */}
        <ul className="mx-auto max-w-sm space-y-2 pt-2">
          {(t('start.whatYouGet', { returnObjects: true }) as string[]).map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="mt-0.5 text-green-500">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </PageLayout>
  )
}
