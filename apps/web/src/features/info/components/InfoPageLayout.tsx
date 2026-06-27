import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface InfoPageLayoutProps {
  title: string
  /** Short descriptive subtitle shown below the title in muted text. */
  subtitle?: string
  /**
   * For legal pages — renders as a styled date badge below the title.
   * Typically the "Last updated: …" string from the info locale.
   */
  lastUpdated?: string
  children: ReactNode
}

/**
 * InfoPageLayout — shared inner wrapper for all public informational pages
 * (About, Contact, Privacy, Terms, Help).
 *
 * The outer shell (header + footer) is provided by RootLayout via the router.
 * This component constrains content to a readable max-width and provides a
 * consistent heading hierarchy and back-navigation link.
 */
export function InfoPageLayout({ title, subtitle, lastUpdated, children }: InfoPageLayoutProps) {
  const { t } = useTranslation('common')

  return (
    <div className="mx-auto max-w-2xl pb-16">
      {/* Back to home */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 active:text-blue-700 transition-colors duration-150 mb-6 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1"
      >
        <ArrowLeft className="w-3 h-3" aria-hidden="true" />
        {t('home')}
      </Link>

      {/* Page heading */}
      <div className="mb-8 pb-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>
        )}
        {lastUpdated && (
          <p className="mt-2.5">
            <time className="inline-flex items-center text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-0.5">
              {lastUpdated}
            </time>
          </p>
        )}
      </div>

      {children}
    </div>
  )
}
