import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useLogin } from '../hooks/useLogin'
import type { LoginFormValues } from '../auth.types'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'
  const { t } = useTranslation('auth')
  const { t: tv } = useTranslation('validation')

  const login = useLogin()

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-blue-600">SafeFamily</h1>
          <p className="mt-2 text-sm text-gray-500">{t('signInTitle')}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')}
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('password')}
              </label>
              <input
                {...register('password')}
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Server error */}
            {errors.root && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {errors.root.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || login.isPending}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
            {login.isPending ? t('loggingIn') : t('loginButton')}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          {t('noAccount')}{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">
            {t('signUp')}
          </Link>
        </p>
      </div>
    </div>
  )
}
