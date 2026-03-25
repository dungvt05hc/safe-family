import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Info, Lock } from 'lucide-react'
import { Alert, Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui'
import { useChangePassword } from '../settings.hooks'
import type { ChangePasswordRequest } from '../settings.types'

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword:     z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path:    ['confirmPassword'],
  })

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
          aria-label={show ? 'Hide password' : 'Show password'}
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
  const [succeeded, setSucceeded] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ChangePasswordRequest>({ resolver: zodResolver(schema) })

  async function onSubmit(data: ChangePasswordRequest) {
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
          <CardTitle>Change password</CardTitle>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-5">
          {succeeded && (
            <Alert variant="success">Password changed successfully.</Alert>
          )}
          {changePassword.isError && (
            <Alert variant="error">
              Failed to change password. Please check your current password and try again.
            </Alert>
          )}

          <PasswordInput
            {...register('currentPassword')}
            label="Current password"
            htmlFor="pwd-current"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.currentPassword?.message}
          />

          <PasswordInput
            {...register('newPassword')}
            label="New password"
            htmlFor="pwd-new"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.newPassword?.message}
          />

          <PasswordInput
            {...register('confirmPassword')}
            label="Confirm new password"
            htmlFor="pwd-confirm"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
          />

          {/* Security tips */}
          <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Use at least 8 characters, one uppercase letter, and one number.
              Never share your password with anyone — SafeFamily staff will never ask for it.
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
            Update password
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
