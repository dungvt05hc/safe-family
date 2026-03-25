import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { useLatestAssessment } from '../hooks/useAssessmentQueries'

export function AssessmentStartPage() {
  const navigate = useNavigate()
  const { data: latest, isLoading } = useLatestAssessment()

  return (
    <PageLayout
      title="Digital Safety Assessment"
      description="Find out how well your family is protected online."
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Hero card */}
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 px-8 py-10 text-center shadow-sm">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
            🛡️
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">How safe is your family online?</h2>
          <p className="text-sm leading-relaxed text-gray-600">
            Answer 22 quick questions across five security categories. You'll get an instant risk
            score, a category breakdown, and personalised actions to improve your family's digital
            safety.
          </p>
          <p className="mt-2 text-xs text-gray-400">Takes about 5 minutes · No personal data collected</p>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { icon: '🔐', label: 'Account Security' },
            { icon: '💻', label: 'Device Hygiene' },
            { icon: '☁️', label: 'Backup & Recovery' },
            { icon: '👁️', label: 'Privacy & Sharing' },
            { icon: '🎣', label: 'Scam Readiness' },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm"
            >
              <span>{icon}</span> {label}
            </span>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => navigate('/assessment/wizard')}
            className="w-full max-w-xs rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Start assessment
          </button>

          {!isLoading && latest && (
            <button
              onClick={() => navigate('/assessment/result')}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              View your last result →
            </button>
          )}
        </div>

        {/* What you'll get */}
        <ul className="mx-auto max-w-sm space-y-2 pt-2">
          {[
            'Overall risk score (0–100)',
            'Per-category score breakdown',
            'Prioritised action recommendations',
            'One-click access to your security checklist',
          ].map((item) => (
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
