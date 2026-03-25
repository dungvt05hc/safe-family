import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Phone, User } from 'lucide-react'
import { Alert, Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui'
import { useSettings, useUpdateProfileSettings } from '../settings.hooks'
import type { ProfileSettings } from '../settings.types'

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email:    z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phone:    z.string().min(8, 'Enter a valid phone number'),
})

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 ' +
  'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ' +
  'disabled:bg-gray-50 disabled:text-gray-500'

const labelCls = 'block text-sm font-medium text-gray-700 mb-1'
const errorCls = 'mt-1 text-xs text-red-600'

// ── Inner form (rendered once data is loaded) ─────────────────────────────────

interface FormProps { defaults: ProfileSettings }

function ProfileForm({ defaults }: FormProps) {
  const update = useUpdateProfileSettings()
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileSettings>({
    resolver:      zodResolver(schema),
    defaultValues: defaults,
  })

  // Keep form in sync if query refreshes
  useEffect(() => { reset(defaults) }, [defaults, reset])

  async function onSubmit(data: ProfileSettings) {
    setSaved(false)
    await update.mutateAsync(data)
    setSaved(true)
    reset(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <CardContent className="space-y-5">
        {/* Success banner */}
        {saved && !isDirty && (
          <Alert variant="success">Profile updated successfully.</Alert>
        )}
        {/* Server error */}
        {update.isError && (
          <Alert variant="error">Failed to save profile. Please try again.</Alert>
        )}

        {/* Full name */}
        <div>
          <label htmlFor="prof-fullName" className={labelCls}>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
              Full name
            </span>
          </label>
          <input
            {...register('fullName')}
            id="prof-fullName"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            className={inputCls}
          />
          {errors.fullName && <p className={errorCls}>{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="prof-email" className={labelCls}>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
              Email address
            </span>
          </label>
          <input
            {...register('email')}
            id="prof-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputCls}
          />
          {errors.email && <p className={errorCls}>{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="prof-phone" className={labelCls}>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
              Phone number
            </span>
          </label>
          <input
            {...register('phone')}
            id="prof-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+61 400 000 000"
            className={inputCls}
          />
          {errors.phone && <p className={errorCls}>{errors.phone.message}</p>}
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!isDirty}
          loading={update.isPending}
        >
          Save changes
        </Button>
      </CardFooter>
    </form>
  )
}

// ── Public component ──────────────────────────────────────────────────────────

/**
 * ProfileSettingsForm — lets the user update their full name, email, and phone.
 */
export function ProfileSettingsForm() {
  const { data, isLoading } = useSettings()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile information</CardTitle>
      </CardHeader>

      {isLoading || !data ? (
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-9 rounded-lg bg-gray-100" />
            ))}
          </div>
        </CardContent>
      ) : (
        <ProfileForm defaults={data.profile} />
      )}
    </Card>
  )
}
