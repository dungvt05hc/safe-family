import { ClipboardList, AlertCircle, Smartphone, ShieldCheck, Users, UserCheck, Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { InfoPageLayout } from '../components/InfoPageLayout'
import { company } from '@/lib/company'

export function AboutPage() {
  const { t } = useTranslation('info')

  const audience = [
    {
      icon: Users,
      heading: t('about.forWho.item0.heading'),
      body: t('about.forWho.item0.body'),
    },
    {
      icon: UserCheck,
      heading: t('about.forWho.item1.heading'),
      body: t('about.forWho.item1.body'),
    },
    {
      icon: Heart,
      heading: t('about.forWho.item2.heading'),
      body: t('about.forWho.item2.body'),
    },
  ]

  const features = [
    {
      icon: ClipboardList,
      heading: t('about.whatWeDo.assessment.heading'),
      body: t('about.whatWeDo.assessment.body'),
    },
    {
      icon: AlertCircle,
      heading: t('about.whatWeDo.incident.heading'),
      body: t('about.whatWeDo.incident.body'),
    },
    {
      icon: Smartphone,
      heading: t('about.whatWeDo.devices.heading'),
      body: t('about.whatWeDo.devices.body'),
    },
  ]

  const steps = [
    { heading: t('about.howItWorks.step0.heading'), body: t('about.howItWorks.step0.body') },
    { heading: t('about.howItWorks.step1.heading'), body: t('about.howItWorks.step1.body') },
    { heading: t('about.howItWorks.step2.heading'), body: t('about.howItWorks.step2.body') },
    { heading: t('about.howItWorks.step3.heading'), body: t('about.howItWorks.step3.body') },
  ]

  return (
    <InfoPageLayout title={t('about.title')} subtitle={t('about.subtitle')}>

      {/* Brand mark */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 shrink-0">
          <ShieldCheck className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{company.name}</p>
          <p className="text-xs text-gray-400">{company.legalName}</p>
        </div>
      </div>

      {/* ── Mission ── */}
      <section aria-labelledby="about-mission" className="mb-10">
        <h2 id="about-mission" className="text-sm font-semibold text-gray-900 mb-2">
          {t('about.mission.heading')}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          {t('about.mission.body')}
        </p>
      </section>

      <hr className="border-gray-100 mb-10" />

      {/* ── Who it's for ── */}
      <section aria-labelledby="about-forwho" className="mb-10">
        <h2 id="about-forwho" className="text-sm font-semibold text-gray-900 mb-1">
          {t('about.forWho.heading')}
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          {t('about.forWho.intro')}
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {audience.map(({ icon: Icon, heading, body }) => (
            <div
              key={heading}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 mb-3">
                <Icon className="w-4 h-4 text-blue-600" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1.5">{heading}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-gray-100 mb-10" />

      {/* ── What we help with ── */}
      <section aria-labelledby="about-helps" className="mb-10">
        <h2 id="about-helps" className="text-sm font-semibold text-gray-900 mb-4">
          {t('about.whatWeDo.heading')}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {features.map(({ icon: Icon, heading, body }) => (
            <div
              key={heading}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <Icon className="w-5 h-5 text-blue-600 mb-2.5" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900 mb-1">{heading}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-gray-100 mb-10" />

      {/* ── How it works ── */}
      <section aria-labelledby="about-howitworks" className="mb-10">
        <h2 id="about-howitworks" className="text-sm font-semibold text-gray-900 mb-5">
          {t('about.howItWorks.heading')}
        </h2>
        <ol className="space-y-0" role="list">
          {steps.map(({ heading, body }, index) => (
            <li key={heading} className="flex gap-4">
              {/* Step spine */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-px flex-1 bg-gray-200 my-1" aria-hidden="true" />
                )}
              </div>
              {/* Step content */}
              <div className={index < steps.length - 1 ? 'pb-6' : ''}>
                <p className="text-sm font-medium text-gray-900 mb-1">{heading}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <hr className="border-gray-100 mb-10" />

      {/* ── Company ── */}
      <section aria-labelledby="about-company">
        <h2 id="about-company" className="text-sm font-semibold text-gray-900 mb-2">
          {t('about.company.heading')}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          {t('about.company.body', { legalName: company.legalName })}
        </p>
      </section>

    </InfoPageLayout>
  )
}
