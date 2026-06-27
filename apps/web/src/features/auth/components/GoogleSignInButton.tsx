import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { AlertCircle } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useExternalLogin } from '../hooks/useExternalLogin'

interface GoogleSignInButtonProps {
  /**
   * Hint passed to Google's analytics/context — does not change the visible
   * button text (both sign-in and sign-up show "Continue with Google" so users
   * never have to decide which flow to use before clicking).
   */
  mode?: 'signin' | 'signup'
  /** Fallback redirect path for returning users if no location state is present. */
  redirectTo?: string
}

/**
 * Renders Google's official "Continue with Google" button.
 *
 * Unified sign-in / sign-up flow:
 * - Returning user with a linked Google account → signed in immediately.
 * - Existing email/password user → Google identity linked, signed in.
 * - Brand-new account → user row created automatically, routed to family
 *   onboarding (/family/new) so they can complete their profile.
 *
 * The ID token is NEVER trusted on the client — it is sent to the backend
 * for server-side verification via POST /api/auth/google.
 */
export function GoogleSignInButton({ mode = 'signin', redirectTo = '/dashboard' }: GoogleSignInButtonProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation('auth')
  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? redirectTo

  const googleLoginMutation = useExternalLogin('Google')
  const [sdkError, setSdkError] = useState(false)

  const errorMessage = googleLoginMutation.isError
    ? (googleLoginMutation.error.isUnauthorized
        ? t('googleAuthDenied')
        : t('googleAuthError'))
    : sdkError
      ? t('googleAuthDenied')
      : null

  return (
    <div className="space-y-2">
      <div
        className={
          googleLoginMutation.isPending
            ? 'pointer-events-none opacity-60 transition-opacity'
            : undefined
        }
      >
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            if (!credentialResponse.credential) return
            setSdkError(false)
            googleLoginMutation.mutate(credentialResponse.credential, {
              onSuccess: (user) =>
                // New users go to family onboarding; returning users go to their
                // originally intended destination (or dashboard as fallback).
                navigate(user.isNewUser ? '/family/new' : from, { replace: true }),
            })
          }}
          onError={() => setSdkError(true)}
          width="100%"
          // Always render "Continue with Google" — the unified wording signals
          // that a single click handles both sign-in and sign-up.
          text="continue_with"
          // context is a hint for Google's analytics / accessibility tree.
          context={mode === 'signup' ? 'signup' : 'signin'}
        />
      </div>

      {googleLoginMutation.isPending && (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 py-2.5">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-xs font-medium text-blue-700">{t('googleVerifying')}</span>
        </div>
      )}

      {errorMessage && (
        <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}
