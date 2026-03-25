import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Bell, CalendarCheck, Mail, ShieldAlert } from 'lucide-react'
import { Alert, Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui'
import { useSettings, useUpdateNotificationSettings } from '../settings.hooks'
import type { NotificationSettings } from '../settings.types'
import { cn } from '@/lib/utils'

// ── Toggle switch ─────────────────────────────────────────────────────────────

interface ToggleProps {
  id:       string
  checked:  boolean
  onChange: (v: boolean) => void
  label:    string
  description: string
  icon:     React.ElementType
}

function Toggle({ id, checked, onChange, label, description, icon: Icon }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-gray-50"
    >
      {/* Icon bubble */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
        <Icon className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
      </div>

      {/* Pill toggle */}
      <div className="shrink-0 mt-0.5">
        <input
          type="checkbox"
          id={id}
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          aria-hidden="true"
          className={cn(
            'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
            checked ? 'bg-blue-600' : 'bg-gray-200',
          )}
        >
          <span
            className={cn(
              'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
              checked ? 'translate-x-4' : 'translate-x-1',
            )}
          />
        </div>
      </div>
    </label>
  )
}

// ── Inner form ────────────────────────────────────────────────────────────────

interface FormProps { defaults: NotificationSettings }

function NotificationForm({ defaults }: FormProps) {
  const update = useUpdateNotificationSettings()
  const [saved, setSaved] = useState(false)

  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<NotificationSettings>({
    defaultValues: defaults,
  })

  useEffect(() => { reset(defaults) }, [defaults, reset])

  async function onSubmit(data: NotificationSettings) {
    setSaved(false)
    await update.mutateAsync(data)
    setSaved(true)
    reset(data)
  }

  const toggles: { field: keyof NotificationSettings; label: string; description: string; icon: React.ElementType }[] = [
    {
      field:       'emailNotifications',
      label:       'Email notifications',
      description: 'Receive a weekly safety digest and important account updates by email.',
      icon:        Mail,
    },
    {
      field:       'bookingUpdates',
      label:       'Booking updates',
      description: 'Get notified when a session is confirmed, rescheduled, or cancelled.',
      icon:        CalendarCheck,
    },
    {
      field:       'incidentAlerts',
      label:       'Incident alerts',
      description: 'Immediate alerts when a new incident report is submitted for your family.',
      icon:        ShieldAlert,
    },
    {
      field:       'reminders',
      label:       'Safety reminders',
      description: 'Periodic nudges to complete your safety checklist and run risk checks.',
      icon:        Bell,
    },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <CardContent className="space-y-1 py-3">
        {saved && !isDirty && (
          <Alert variant="success" className="mb-2">Notification preferences saved.</Alert>
        )}
        {update.isError && (
          <Alert variant="error" className="mb-2">Failed to save preferences. Please try again.</Alert>
        )}

        {toggles.map(({ field, label, description, icon }) => (
          <Controller
            key={field}
            control={control}
            name={field}
            render={({ field: f }) => (
              <Toggle
                id={`notif-${field}`}
                checked={f.value}
                onChange={f.onChange}
                label={label}
                description={description}
                icon={icon}
              />
            )}
          />
        ))}
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!isDirty}
          loading={update.isPending}
        >
          Save preferences
        </Button>
      </CardFooter>
    </form>
  )
}

// ── Public component ──────────────────────────────────────────────────────────

/**
 * NotificationSettingsForm — toggle email, booking, incident, and reminder
 * notification preferences with an on/off pill switch.
 */
export function NotificationSettingsForm() {
  const { data, isLoading } = useSettings()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-500" aria-hidden="true" />
          <CardTitle>Notification preferences</CardTitle>
        </div>
      </CardHeader>

      {isLoading || !data ? (
        <CardContent>
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex items-center gap-4 px-4 py-3">
                <div className="h-9 w-9 rounded-xl bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-40 rounded bg-gray-100" />
                  <div className="h-3 w-64 rounded bg-gray-100" />
                </div>
                <div className="h-5 w-9 rounded-full bg-gray-100 shrink-0" />
              </div>
            ))}
          </div>
        </CardContent>
      ) : (
        <NotificationForm defaults={data.notifications} />
      )}
    </Card>
  )
}
