import { Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { InfoPageLayout } from '../components/InfoPageLayout'
import { InfoSection } from '../components/InfoSection'
import { company } from '@/lib/company'

interface PolicySection {
  id: string
  heading: string
  body: string
}

export function PrivacyPage() {
  const { t } = useTranslation('info')

  const sections: PolicySection[] = [
    {
      id: 'collect',
      heading: t('privacy.collect.heading'),
      body: t('privacy.collect.body'),
    },
    {
      id: 'use',
      heading: t('privacy.use.heading'),
      body: t('privacy.use.body'),
    },
    {
      id: 'storage',
      heading: t('privacy.storage.heading'),
      body: t('privacy.storage.body'),
    },
    {
      id: 'thirdParty',
      heading: t('privacy.thirdParty.heading'),
      body: t('privacy.thirdParty.body'),
    },
    {
      id: 'cookies',
      heading: t('privacy.cookies.heading'),
      body: t('privacy.cookies.body'),
    },
    {
      id: 'rights',
      heading: t('privacy.rights.heading'),
      body: t('privacy.rights.body', { email: company.supportEmail }),
    },
  ]

  return (
    <InfoPageLayout
      title={t('privacy.title')}
      lastUpdated={t('privacy.subtitle')}
    >
      {/* Introduction */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 mb-8">
        <p className="text-sm text-gray-700 leading-relaxed">
          {t('privacy.intro.body')}
        </p>
      </div>

      {/* Numbered sections */}
      <div>
        {sections.map((section, index) => (
          <InfoSection
            key={section.id}
            id={`privacy-${section.id}`}
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
            {t('privacy.contactInfo.heading')}
          </h2>
          <p className="text-sm text-blue-700 leading-relaxed mb-2">
            {t('privacy.contactInfo.body', { email: company.supportEmail })}
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
        {t('privacy.changes.body')}
      </p>
    </InfoPageLayout>

  )
}
