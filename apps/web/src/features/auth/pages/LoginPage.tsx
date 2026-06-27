import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLogin } from '../hooks/useLogin'
import { AuthCard } from '../components/AuthCard'
import { SocialAuthDivider } from '../components/SocialAuthDivider'
import { SocialAuthButtons } from '../components/SocialAuthButtons'
import type { LoginFormValues } from '../auth.types'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'
  const { t } = useTranslation('auth')
  const { t: tv } = useTranslation('validation')

  const login = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, tv('email.required')).email(tv('email.invalid')),
        password: z.string().min(1, tv('password.required')),
      }),
    [tv],
  )

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(data: LoginFormValues) {
    login.mutate(data, {
      onSuccess: () => navigate(from, { replace: true }),
      onError: (err) =>
        setError('root', {
          message: err.isUnauthorized
            ? t('invalidCredentials')
            : (err.message ?? t('invalidCredentials')),
        }),
    })
  }

  return (
    <AuthCard
      title={t('signInTitle')}
      footer={
        <>
          {t('noAccount')}{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">
            {t('signUp')}
          </Link>
        </>
      }
    >
      {/* Google — primary, social-first */}
      <SocialAuthButtons mode="signin" redirectTo={from} />

      {/* Divider */}
      <SocialAuthDivider text={t('orUseEmail')} />

      {/* Email / password form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
            {t('email')}
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 aria-[invalid=true]:border-red-400"
          />
          {errors.email && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              {t('password')}
            </label>
            <span className="text-xs text-blue-600 cursor-default select-none">
              {t('forgotPassword')}
            </span>
          </div>
          <div className="relative">
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 aria-[invalid=true]:border-red-400"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword
                ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                : <Eye className="h-4 w-4" aria-hidden="true" />
              }
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Server / root error */}
        {errors.root && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
            <span>{errors.root.message}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || login.isPending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {login.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
              {t('loggingIn')}
            </span>
          ) : (
            t('loginButton')
          )}
        </button>
      </form>
    </AuthCard>
  )
}
