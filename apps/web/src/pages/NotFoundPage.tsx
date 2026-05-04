import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * NotFoundPage — rendered by React Router's errorElement when a route
 * throws or no path matches.
 */
export function NotFoundPage() {
  const error = useRouteError()
  const { t } = useTranslation('errors')

  const is404 =
    isRouteErrorResponse(error) ? error.status === 404 : false

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-4">
        <p className="text-7xl font-extrabold text-gray-200">{is404 ? '404' : 'Oops'}</p>
        <h1 className="text-2xl font-bold text-gray-800">
          {is404 ? t('notFoundPage.title404') : t('notFoundPage.titleGeneric')}
        </h1>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">
          {is404
            ? t('notFoundPage.desc404')
            : t('notFoundPage.descGeneric')}
        </p>
        <Link
          to="/"
          className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          {t('notFoundPage.backHome')}
        </Link>
      </div>
    </div>
  )
}
