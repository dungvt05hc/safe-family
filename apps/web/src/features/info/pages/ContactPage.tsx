import { Mail, Phone, MapPin, Globe, Clock, Info, Send } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InfoPageLayout } from '../components/InfoPageLayout'
import { company } from '@/lib/company'

export function ContactPage() {
  const { t } = useTranslation('info')

  const nameRef    = useRef<HTMLInputElement>(null)
  const emailRef   = useRef<HTMLInputElement>(null)
  const subjectRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name    = nameRef.current?.value.trim()    ?? ''
    const replyTo = emailRef.current?.value.trim()   ?? ''
    const subject = subjectRef.current?.value.trim() ?? ''
    const body    = messageRef.current?.value.trim() ?? ''

    const mailtoBody = `Name: ${name}\nEmail: ${replyTo}\n\n${body}`
    window.open(
      `mailto:${company.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailtoBody)}`,
      '_blank',
    )
    setSent(true)
  }

  const contactItems = [
    {
      icon: MapPin,
      label: t('contact.details.labels.address'),
      value: `${company.address.street}, ${company.address.cityLine}, ${company.address.country}`,
    },
    {
      icon: Phone,
      label: t('contact.details.labels.phone'),
      value: company.phone,
      href: `tel:${company.phone.replace(/\s/g, '')}`,
    },
    {
      icon: Mail,
      label: t('contact.details.labels.email'),
      value: company.supportEmail,
      href: `mailto:${company.supportEmail}`,
    },
    {
      icon: Globe,
      label: t('contact.details.labels.website'),
      value: company.website.replace('https://', ''),
      href: company.website,
      external: true,
    },
  ]

  return (
    <InfoPageLayout title={t('contact.title')} subtitle={t('contact.subtitle')}>

      {/* ── Contact details ── */}
      <section aria-labelledby="contact-details" className="mb-8">
        <h2 id="contact-details" className="text-sm font-semibold text-gray-900 mb-3">
          {t('contact.details.heading')}
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
          {contactItems.map(({ icon: Icon, label, value, href, external }) => (
            <div key={label} className="flex items-start gap-3 px-4 py-3">
              <Icon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                {href ? (
                  <a
                    href={href}
                    className="text-sm text-gray-700 hover:text-blue-600 hover:underline transition-colors break-all"
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-sm text-gray-700 leading-snug">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact form ── */}
      <section aria-labelledby="contact-form" className="mb-8">
        <h2 id="contact-form" className="text-sm font-semibold text-gray-900 mb-3">
          {t('contact.form.heading')}
        </h2>

        {sent ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex gap-3">
            <Send className="w-4 h-4 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-green-700 leading-relaxed">
              {t('contact.form.note')}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-gray-200 bg-white p-5 space-y-4"
            noValidate
          >
            {/* Name + Email row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cf-name" className="block text-xs font-medium text-gray-700 mb-1.5">
                  {t('contact.form.name.label')}
                </label>
                <input
                  ref={nameRef}
                  id="cf-name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder={t('contact.form.name.placeholder')}
                  className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="cf-email" className="block text-xs font-medium text-gray-700 mb-1.5">
                  {t('contact.form.email.label')}
                </label>
                <input
                  ref={emailRef}
                  id="cf-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder={t('contact.form.email.placeholder')}
                  className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="cf-subject" className="block text-xs font-medium text-gray-700 mb-1.5">
                {t('contact.form.subject.label')}
              </label>
              <input
                ref={subjectRef}
                id="cf-subject"
                type="text"
                required
                placeholder={t('contact.form.subject.placeholder')}
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="cf-message" className="block text-xs font-medium text-gray-700 mb-1.5">
                {t('contact.form.message.label')}
              </label>
              <textarea
                ref={messageRef}
                id="cf-message"
                rows={4}
                required
                placeholder={t('contact.form.message.placeholder')}
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors resize-none"
              />
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              <p className="text-xs text-gray-400 leading-relaxed">
                {t('contact.form.note')}
              </p>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
                {t('contact.form.submit')}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* ── Support hours ── */}
      <section aria-labelledby="contact-hours" className="mb-8">
        <div className="rounded-lg border border-gray-200 bg-white p-4 flex gap-3">
          <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h2 id="contact-hours" className="text-sm font-semibold text-gray-900 mb-1">
              {t('contact.hours.heading')}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t('contact.hours.body')}
            </p>
          </div>
        </div>
      </section>

      {/* ── Account enquiries note ── */}
      <section aria-labelledby="contact-note">
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 flex gap-3">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h2 id="contact-note" className="text-sm font-semibold text-blue-800 mb-1">
              {t('contact.note.heading')}
            </h2>
            <p className="text-sm text-blue-700 leading-relaxed">
              {t('contact.note.body', { email: company.supportEmail })}
            </p>
          </div>
        </div>
      </section>

    </InfoPageLayout>
  )
}
