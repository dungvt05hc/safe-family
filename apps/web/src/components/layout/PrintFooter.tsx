import { useTranslation } from 'react-i18next'
import { company } from '@/lib/company'

interface PrintFooterProps {
  /** Override the year shown in the copyright line (defaults to current year). */
  year?: number
  /**
   * Show a confidentiality notice below the copyright line.
   * Suitable for sensitive documents such as incident recovery packs.
   * Defaults to false.
   */
  confidential?: boolean
  /**
   * Date the document was generated. When provided, renders a
   * "Generated: DD Month YYYY" line in the top-right of the footer.
   * Accepts a Date object or an ISO date string.
   */
  generatedAt?: Date | string
  /**
   * When true, the footer is hidden on screen and only visible when
   * printing or exporting to PDF. Useful for listing/dashboard pages
   * where showing a document footer on screen would look odd.
   * Defaults to false (footer visible on both screen and print).
   */
  hideOnScreen?: boolean
}

/**
 * PrintFooter — compact, document-quality footer for printable pages
 * (PDF reports, family safety plans, incident recovery packs, etc.).
 *
 * Renders on screen by default. Use `hideOnScreen` on listing/dashboard pages
 * where the footer should only appear in print/PDF. The global AppFooter is
 * suppressed when printing, so this is the only footer on paper.
 *
 * Layout (two-column):
 *   Brand + address  |  Generated date (if provided) · Phone · Email · Website
 *   ─────────────────────────────────────────────────────────────────────────────
 *   Copyright                                       Confidential notice (opt.)
 *
 * Usage:
 *   import { PrintFooter } from '@/components/layout/PrintFooter'
 *   <PrintFooter generatedAt={plan.createdAt} />
 *   <PrintFooter generatedAt={pack.createdAt} confidential />
 *   <PrintFooter hideOnScreen />   // listing pages — only shows on print
 */
export function PrintFooter({
  year,
  confidential = false,
  generatedAt,
  hideOnScreen = false,
}: PrintFooterProps) {
  const { t, i18n } = useTranslation('footer')
  const { name, legalName, supportEmail, phone, website, address } = company

  // Use the active language for date formatting so Vietnamese users see localised dates
  const dateLocale = i18n.language.startsWith('vi') ? 'vi-VN' : 'en-AU'
  const formattedDate = generatedAt
    ? new Date(generatedAt).toLocaleDateString(dateLocale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <footer
      className={[
        'mt-10 pt-3 border-t border-gray-200 text-[10px] leading-snug text-gray-500',
        hideOnScreen ? 'hidden print:block' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Document footer"
    >
      {/* ── Brand + contact row ──────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        {/* Left: brand + address */}
        <div className="space-y-0.5">
          <p className="text-[11px] font-bold text-gray-800 tracking-tight">{name}</p>
          <p className="text-gray-400">{legalName}</p>
          <p className="mt-0.5">
            <span className="font-medium">{t('contact.address')}:</span>{' '}
            {address.street}, {address.cityLine}, {address.country}
          </p>
        </div>

        {/* Right: generated date + contact details */}
        <div className="space-y-0.5 sm:text-right">
          {formattedDate && (
            <p className="font-medium text-gray-600">
              {t('print.generatedAt', { date: formattedDate })}
            </p>
          )}
          <p>
            <span className="font-medium">{t('contact.phone')}:</span>{' '}
            <a href={`tel:${phone}`}>{phone}</a>
          </p>
          <p>
            <span className="font-medium">{t('contact.support')}:</span>{' '}
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
          </p>
          <p>
            <span className="font-medium">{t('contact.website')}:</span>{' '}
            {website.replace('https://', '')}
          </p>
        </div>
      </div>

      {/* ── Copyright + optional confidential notice ─────────────────── */}
      <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-0.5 sm:flex-row sm:justify-between">
        <p className="text-gray-500">
          {t('legal.copyright', {
            year: year ?? new Date().getFullYear(),
            legalName,
          })}
        </p>
        {confidential && (
          <p className="italic text-gray-400">{t('print.confidential')}</p>
        )}
      </div>
    </footer>
  )
}

