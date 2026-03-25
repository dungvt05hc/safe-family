import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom'

/**
 * NotFoundPage — rendered by React Router's errorElement when a route
 * throws or no path matches.
 */
export function NotFoundPage() {
  const error = useRouteError()

  const is404 =
    isRouteErrorResponse(error) ? error.status === 404 : false

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-4">
        <p className="text-7xl font-extrabold text-gray-200">{is404 ? '404' : 'Oops'}</p>
        <h1 className="text-2xl font-bold text-gray-800">
          {is404 ? 'Page not found' : 'Something went wrong'}
        </h1>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">
          {is404
            ? "The page you're looking for doesn't exist or has been moved."
            : 'An unexpected error occurred. Please try again.'}
        </p>
        <Link
          to="/"
          className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
