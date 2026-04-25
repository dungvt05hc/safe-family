import { useTranslation } from 'react-i18next'
import { ApiError } from '@/types/api'

/**
 * Translates an API error (or any unknown error) into a localized message.
 *
 * Well-known HTTP status categories (network, 401, 402, 403, 404, 409, 5xx)
 * are always mapped to translated messages from the `errors` namespace.
 *
 * For other cases, `fallbackKey` (e.g. `'load.accounts'`) is used when provided;
 * otherwise falls back to `errors.unknown`.
 *
 * Returns an empty string when `err` is falsy, so the result is safe to use
 * directly in a conditional render: `{errorMsg && <Alert>{errorMsg}</Alert>}`.
 */
export function useApiError(err: unknown, fallbackKey?: string): string {
  const { t } = useTranslation('errors')
  if (!err) return ''
  if (err instanceof ApiError) {
    if (err.isNetworkError)    return t('network')
    if (err.isUnauthorized)    return t('unauthorized')
    if (err.isForbidden)       return t('forbidden')
    if (err.isNotFound)        return t('notFound')
    if (err.isPaymentRequired) return t('paymentRequired')
    if (err.isConflict)        return t('conflict')
    if (err.isServerError)     return t('serverError')
    // For unexpected 4xx with a domain-specific fallback, prefer the translated key
    if (fallbackKey)           return t(fallbackKey as Parameters<typeof t>[0])
    return err.message || t('unknown')
  }
  if (fallbackKey) return t(fallbackKey as Parameters<typeof t>[0])
  return t('unknown')
}
