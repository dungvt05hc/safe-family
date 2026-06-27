import { Globe, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { company } from '@/lib/company'
import { footerLinksByGroup, visibleFooterLinks } from '@/lib/footerNav'

interface AppFooterProps {
  /** Additional CSS classes to merge onto the root element. */
  className?: string
}

/**
 * AppFooter — full-width screen footer at the bottom of the authenticated app.
 *
 * Placed OUTSIDE the max-w-5xl content column so its top border spans the
 * full width of the main area. The inner content mirrors the same max-width
 * and horizontal padding as the page content above it.
 *
 * Three-column layout (About · Contact · Legal) collapses to one column on
 * mobile. Hidden entirely when printing — use PrintFooter for documents.
 *
 * Footer navigation is driven by @/lib/footerNav.ts. Add, remove, or toggle
 * links there without touching this component.
 *
 * Usage:
 *   import { AppFooter } from '@/components/layout/AppFooter'
 *   <AppFooter />
 */
export function AppFooter({ className }: AppFooterProps) {
  const { t } = useTranslation('footer')

  const legalLinks = footerLinksByGroup('legal')
  const allVisible = visibleFooterLinks()

  return (
    <footer
      className={[
        'border-t border-gray-200 bg-white print:hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Site footer"
    >
      {/* Match the same padding + max-width used by the page content column */}
      <div className="mx-auto max-w-5xl w-full px-4 lg:px-6 py-10">
        {/* ── Main columns ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">

          {/* About */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 shrink-0">
                <ShieldCheck className="w-[18px] h-[18px] text-white" aria-hidden="true" />
              </div>
              <span className="text-sm font-semibold text-gray-900 tracking-tight">{company.name}</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t('about.tagline')}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              {t('contact.heading')}
            </h3>
            <ul className="space-y-2.5">
              <li
                className="flex items-start gap-2 text-xs text-gray-500"
                aria-label={t('contact.address')}
              >
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" aria-hidden="true" />
                <span className="leading-relaxed">
                  {company.address.street}
                  <br />
                  {company.address.cityLine}, {company.address.country}
                </span>
              </li>
              <li
                className="flex items-center gap-2 text-xs text-gray-500"
                aria-label={t('contact.phone')}
              >
                <Phone className="w-3.5 h-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                <a
                  href={`tel:${company.phone.replace(/\s/g, '')}`}
                  className="rounded-sm hover:text-blue-600 hover:underline underline-offset-2 active:text-blue-700 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1"
                >
                  {company.phone}
                </a>
              </li>
              <li
                className="flex items-center gap-2 text-xs text-gray-500"
                aria-label={t('contact.support')}
              >
                <Mail className="w-3.5 h-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                <a
                  href={`mailto:${company.supportEmail}`}
                  className="rounded-sm hover:text-blue-600 hover:underline underline-offset-2 active:text-blue-700 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1"
                >
                  {company.supportEmail}
                </a>
              </li>
              <li
                className="flex items-center gap-2 text-xs text-gray-500"
                aria-label={t('contact.website')}
              >
                <Globe className="w-3.5 h-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm hover:text-blue-600 hover:underline underline-offset-2 active:text-blue-700 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1"
                >
                  {company.website.replace('https://', '')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal — driven by footerLinksByGroup('legal') */}
          {legalLinks.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                {t('legal.heading')}
              </h3>
              <ul className="space-y-1.5">
                {legalLinks.map((link) => (
                  <li key={link.key}>
                    {link.external ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 hover:text-blue-600 hover:underline underline-offset-2 decoration-1 active:text-blue-700 transition-colors duration-150 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1"
                      >
                        {t(`links.${link.key}`)}
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="text-xs text-gray-500 hover:text-blue-600 hover:underline underline-offset-2 decoration-1 active:text-blue-700 transition-colors duration-150 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1"
                      >
                        {t(`links.${link.key}`)}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* ── Bottom bar: copyright + flat nav strip ───────────────────── */}
        <div className="mt-10 pt-4 border-t border-gray-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            {t('legal.copyright', {
              year: new Date().getFullYear(),
              legalName: company.legalName,
            })}
          </p>

          {allVisible.length > 0 && (
            <nav aria-label="Footer links">
              <ul className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                {allVisible.map((link, index) => (
                  <Fragment key={link.key}>
                    {index > 0 && (
                      <li aria-hidden="true" className="text-gray-300 select-none pointer-events-none">
                        ·
                      </li>
                    )}
                    <li>
                      {link.external ? (
                        <a
                          href={link.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-500 hover:text-blue-600 active:text-blue-700 transition-colors duration-150 rounded-sm px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1"
                        >
                          {t(`links.${link.key}`)}
                        </a>
                      ) : (
                        <Link
                          to={link.path}
                          className="text-xs text-gray-500 hover:text-blue-600 active:text-blue-700 transition-colors duration-150 rounded-sm px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1"
                        >
                          {t(`links.${link.key}`)}
                        </Link>
                      )}
                    </li>
                  </Fragment>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </footer>
  )
}
