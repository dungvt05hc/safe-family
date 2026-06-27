import { Link, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRegister } from '../hooks/useRegister'
import { AuthCard } from '../components/AuthCard'
import { SocialAuthDivider } from '../components/SocialAuthDivider'
import { SocialAuthButtons } from '../components/SocialAuthButtons'
import type { RegisterFormValues } from '../auth.types'

export function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('auth')
  const { t: tv } = useTranslation('validation')
  const register_ = useRegister()
  const [showPassword, setShowPassword] = useState(false)

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, tv('email.required')).email(tv('email.invalid')),
        displayName: z
          .string()
          .min(1, tv('displayName.required'))
          .max(200, tv('displayName.max')),
        password: z
          .string()
          .min(8, tv('password.min'))
          .max(100, tv('password.max')),
      }),
    [tv],
  )

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(data: RegisterFormValues) {
    register_.mutate(data, {
      onSuccess: (result) => navigate(result.isNewUser ? '/family/new' : '/dashboard', { replace: true }),
      onError: (err) =>
        setError('root', {
          message: err.isConflict ? t('emailConflict') : t('registerError'),
        }),
    })
  }

  return (
    <AuthCard
      title={t('registerTitle')}
      footer={
        <>
          {t('haveAccount')}{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            {t('loginLink')}
          </Link>
        </>
      }
    >
      {/* Google — primary, social-first */}
      <SocialAuthButtons mode="signup" />

      {/* Divider */}
      <SocialAuthDivider text={t('orUseEmail')} />

      {/* Email / display name / password form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

        {/* Display name */}
        <div>
          <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium text-gray-700">
            {t('displayNameLabel')}
          </label>
          <input
            {...register('displayName')}
            id="displayName"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            aria-invalid={!!errors.displayName}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 aria-[invalid=true]:border-red-400"
          />
          {errors.displayName && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {errors.displayName.message}
            </p>
          )}
        </div>

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
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
            {t('password')}
          </label>
          <div className="relative">
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="At least 8 characters"
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
          disabled={isSubmitting || register_.isPending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {register_.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
              {t('registering')}
            </span>
          ) : (
            t('registerButton')
          )}
        </button>
      </form>
    </AuthCard>
  )
}
