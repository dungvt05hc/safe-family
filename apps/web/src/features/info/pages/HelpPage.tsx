import {
  ChevronDown,
  Rocket,
  Users,
  Smartphone,
  ClipboardList,
  AlertCircle,
  CreditCard,
  Mail,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InfoPageLayout } from '../components/InfoPageLayout'
import { company } from '@/lib/company'

interface FaqItem {
  q: string
  a: string
}

interface FaqCategory {
  icon: React.ElementType
  heading: string
  items: FaqItem[]
}

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
      {items.map(({ q, a }, index) => {
        const isOpen = openIndex === index
        return (
          <div key={q}>
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3.5 text-left"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span className="text-sm font-medium text-gray-900 pr-4">{q}</span>
              <ChevronDown
                className={[
                  'w-4 h-4 text-gray-400 shrink-0 transition-transform duration-150',
                  isOpen ? 'rotate-180' : '',
                ].join(' ')}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function HelpPage() {
  const { t } = useTranslation('info')

  const categories: FaqCategory[] = [
    {
      icon: Rocket,
      heading: t('help.gettingStarted.heading'),
      items: [
        { q: t('help.gettingStarted.q0'), a: t('help.gettingStarted.a0') },
        { q: t('help.gettingStarted.q1'), a: t('help.gettingStarted.a1') },
        { q: t('help.gettingStarted.q2'), a: t('help.gettingStarted.a2') },
      ],
    },
    {
      icon: Users,
      heading: t('help.family.heading'),
      items: [
        { q: t('help.family.q0'), a: t('help.family.a0') },
        { q: t('help.family.q1'), a: t('help.family.a1') },
        { q: t('help.family.q2'), a: t('help.family.a2') },
      ],
    },
    {
      icon: Smartphone,
      heading: t('help.devices.heading'),
      items: [
        { q: t('help.devices.q0'), a: t('help.devices.a0') },
        { q: t('help.devices.q1'), a: t('help.devices.a1') },
        { q: t('help.devices.q2'), a: t('help.devices.a2') },
      ],
    },
    {
      icon: ClipboardList,
      heading: t('help.assessments.heading'),
      items: [
        { q: t('help.assessments.q0'), a: t('help.assessments.a0') },
        { q: t('help.assessments.q1'), a: t('help.assessments.a1') },
        { q: t('help.assessments.q2'), a: t('help.assessments.a2') },
      ],
    },
    {
      icon: AlertCircle,
      heading: t('help.incidents.heading'),
      items: [
        { q: t('help.incidents.q0'), a: t('help.incidents.a0') },
        { q: t('help.incidents.q1'), a: t('help.incidents.a1') },
        { q: t('help.incidents.q2'), a: t('help.incidents.a2') },
      ],
    },
    {
      icon: CreditCard,
      heading: t('help.billing.heading'),
      items: [
        { q: t('help.billing.q0'), a: t('help.billing.a0') },
        { q: t('help.billing.q1'), a: t('help.billing.a1') },
        { q: t('help.billing.q2'), a: t('help.billing.a2') },
      ],
    },
  ]

  return (
    <InfoPageLayout title={t('help.title')} subtitle={t('help.subtitle')}>
      {/* FAQ categories */}
      <div className="space-y-8">
        {categories.map(({ icon: Icon, heading, items }, catIndex) => (
          <section key={heading} aria-labelledby={`help-cat-${catIndex}`}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
              <h2
                id={`help-cat-${catIndex}`}
                className="text-sm font-semibold text-gray-900"
              >
                {heading}
              </h2>
            </div>
            <FaqAccordion items={items} />
          </section>
        ))}
      </div>

      {/* Still need help? */}
      <div className="mt-10 rounded-lg border border-blue-100 bg-blue-50 p-5 flex gap-3">
        <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-semibold text-blue-900 mb-1">
            {t('help.stillNeedHelp.heading')}
          </h2>
          <p className="text-sm text-blue-700 leading-relaxed">
            {t('help.stillNeedHelp.body', { email: '' }).replace(/ $/, '')}
          </p>
          <a
            href={`mailto:${company.supportEmail}`}
            className="mt-1 inline-block text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            {company.supportEmail}
          </a>
        </div>
      </div>
    </InfoPageLayout>
  )
}
