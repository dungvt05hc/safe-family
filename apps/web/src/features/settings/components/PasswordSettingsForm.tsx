import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Info, Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Alert, Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui'
import { useChangePassword } from '../settings.hooks'
import { makePasswordSchema, type PasswordFormValues } from '../settings.schema'

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm placeholder-gray-400 ' +
  'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

const labelCls = 'block text-sm font-medium text-gray-700 mb-1'
const errorCls = 'mt-1 text-xs text-red-600'

// ── Password input with show/hide toggle ──────────────────────────────────────

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label:   string
  htmlFor: string
  error?:  string
}

function PasswordInput({ label, htmlFor, error, ...rest }: PasswordInputProps) {
  const [show, setShow] = useState(false)
  const { t } = useTranslation('settings')
  return (
    <div>
      <label htmlFor={htmlFor} className={labelCls}>
        {label}
      </label>
      <div className="relative">
        <input
          {...rest}
          id={htmlFor}
          type={show ? 'text' : 'password'}
          className={inputCls}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
          aria-label={show ? t('security.hidePassword') : t('security.showPassword')}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className={errorCls}>{error}</p>}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * PasswordSettingsForm — lets the user change their account password.
 * Includes inline strength hints and show/hide toggles.
 */
export function PasswordSettingsForm() {
  const changePassword = useChangePassword()
  const { t } = useTranslation('settings')
  const [succeeded, setSucceeded] = useState(false)

  const schema = useMemo(() => makePasswordSchema({
    currentRequired: t('validation.security.currentPasswordRequired'),
    newMin:          t('validation.security.newPasswordMin'),
    newUppercase:    t('validation.security.newPasswordUppercase'),
    newNumber:       t('validation.security.newPasswordNumber'),
    confirmRequired: t('validation.security.confirmPasswordRequired'),
    mismatch:        t('validation.security.passwordsMismatch'),
  }), [t])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(data: PasswordFormValues) {
    setSucceeded(false)
    await changePassword.mutateAsync(data)
    setSucceeded(true)
    reset()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-500" aria-hidden="true" />
          <CardTitle>{t('security.cardTitle')}</CardTitle>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-5">
          {succeeded && (
            <Alert variant="success">{t('security.saved')}</Alert>
          )}
          {changePassword.isError && (
            <Alert variant="error">
              {t('security.error')}
            </Alert>
          )}

          <PasswordInput
            {...register('currentPassword')}
            label={t('security.currentPassword')}
            htmlFor="pwd-current"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.currentPassword?.message}
          />

          <PasswordInput
            {...register('newPassword')}
            label={t('security.newPassword')}
            htmlFor="pwd-new"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.newPassword?.message}
          />

          <PasswordInput
            {...register('confirmPassword')}
            label={t('security.confirmPassword')}
            htmlFor="pwd-confirm"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
          />

          {/* Security tips */}
          <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-xs text-blue-700 leading-relaxed">
              {t('security.tip')}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!isDirty}
            loading={changePassword.isPending}
          >
            {t('security.updatePassword')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
