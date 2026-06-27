import { Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { InfoPageLayout } from '../components/InfoPageLayout'
import { InfoSection } from '../components/InfoSection'
import { company } from '@/lib/company'

interface TermsSection {
  id: string
  heading: string
  body: string
}

export function TermsPage() {
  const { t } = useTranslation('info')

  const sections: TermsSection[] = [
    {
      id: 'acceptance',
      heading: t('terms.acceptance.heading'),
      body: t('terms.acceptance.body'),
    },
    {
      id: 'service',
      heading: t('terms.service.heading'),
      body: t('terms.service.body'),
    },
    {
      id: 'responsibilities',
      heading: t('terms.responsibilities.heading'),
      body: t('terms.responsibilities.body', { email: company.supportEmail }),
    },
    {
      id: 'payment',
      heading: t('terms.payment.heading'),
      body: t('terms.payment.body'),
    },
    {
      id: 'ip',
      heading: t('terms.ip.heading'),
      body: t('terms.ip.body', { legalName: company.legalName }),
    },
    {
      id: 'disclaimers',
      heading: t('terms.disclaimers.heading'),
      body: t('terms.disclaimers.body'),
    },
    {
      id: 'liability',
      heading: t('terms.liability.heading'),
      body: t('terms.liability.body', { legalName: company.legalName }),
    },
    {
      id: 'law',
      heading: t('terms.law.heading'),
      body: t('terms.law.body'),
    },
  ]

  return (
    <InfoPageLayout
      title={t('terms.title')}
      lastUpdated={t('terms.subtitle')}
    >
      {/* Introduction */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 mb-8">
        <p className="text-sm text-gray-700 leading-relaxed">
          {t('terms.intro.body', { legalName: company.legalName })}
        </p>
      </div>

      {/* Numbered sections */}
      <div>
        {sections.map((section, index) => (
          <InfoSection
            key={section.id}
            id={`terms-${section.id}`}
            heading={section.heading}
            index={index}
            divider={index > 0}
          >
            <p className="text-sm text-gray-600 leading-relaxed">{section.body}</p>
          </InfoSection>
        ))}
      </div>

      {/* Contact card */}
      <div className="mt-10 rounded-lg border border-blue-100 bg-blue-50 p-5 flex gap-3">
        <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-semibold text-blue-800 mb-1">
            {t('terms.contactInfo.heading')}
          </h2>
          <p className="text-sm text-blue-700 leading-relaxed mb-2">
            {t('terms.contactInfo.body', { email: company.supportEmail })}
          </p>
          <a
            href={`mailto:${company.supportEmail}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            {company.supportEmail}
          </a>
        </div>
      </div>

      {/* Changes footnote */}
      <p className="mt-8 pt-5 border-t border-gray-100 text-xs text-gray-400 leading-relaxed">
        {t('terms.changes.body')}
      </p>
    </InfoPageLayout>
  )
}

