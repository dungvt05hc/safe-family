import { useTranslation } from 'react-i18next'
import { PageLayout } from '@/components/layout/PageLayout'

export function HomePage() {
  const { t } = useTranslation('common')
  return (
    <PageLayout
      title={t('homePage.title')}
      description={t('homePage.description')}
    >
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500 text-sm">{t('homePage.placeholder')}</p>
      </div>
    </PageLayout>
  )
}
