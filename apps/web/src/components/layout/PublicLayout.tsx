import { Link, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppFooter } from '@/components/layout/AppFooter'

/**
 * PublicLayout — lightweight shell for publicly accessible informational pages:
 * About, Contact, Privacy Policy, Terms of Service, Help.
 *
 * Intentionally has NO dependency on useCurrentUser / auth state.
 * The header is purely static so these pages load instantly without any
 * auth-check delay, and can be cached and served as static pages if needed.
 *
 * Authenticated users arriving here see "Sign In" — clicking it routes through
 * GuestRoute which immediately redirects them to /dashboard.
 */
export function PublicLayout() {
  const { t } = useTranslation('common')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="font-bold text-lg text-blue-600 tracking-tight hover:text-blue-700 transition-colors"
          >
            SafeFamily
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <Link
              to="/login"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t('signIn')}
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-700 transition-colors"
            >
              {t('signUp')}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <AppFooter />
    </div>
  )
}
