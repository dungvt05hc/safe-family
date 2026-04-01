import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, List } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button, Alert } from '@/components/ui'
import { useServicePackages } from '../hooks/useBookingQueries'
import { useCreateBooking } from '../hooks/useBookingMutations'
import { CHANNEL_CONFIG, type BookingChannel } from '../bookings.types'
import { ServicePackagesSection } from '../components/ServicePackagesSection'

const schema = z.object({
  packageId: z.string().uuid('Please select a package'),
  preferredStartAt: z.string().min(1, 'Please select a date and time'),
  channel: z.enum(['Online', 'Phone', 'Email', 'Onsite'] as const, {
    errorMap: () => ({ message: 'Please select how you would like to connect' }),
  }),
  notes: z.string().max(1000, 'Notes must be 1000 characters or fewer').optional(),
})

type FormValues = z.infer<typeof schema>

function toUtcIsoString(localDateTime: string): string {
  return new Date(localDateTime).toISOString()
}

export function BookingFormPage() {
  const navigate = useNavigate()
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)

  const { data: packages, isLoading: packagesLoading } = useServicePackages()
  const { mutate: createBooking, isPending, isError } = useCreateBooking()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  function handlePackageSelect(id: string) {
    setSelectedPackageId(id)
    setValue('packageId', id, { shouldValidate: true })
  }

  function onSubmit(values: FormValues) {
    createBooking(
      {
        ...values,
        preferredStartAt: toUtcIsoString(values.preferredStartAt),
        notes: values.notes || undefined,
      },
      { onSuccess: (booking) => navigate(`/bookings/${booking.id}`) },
    )
  }

  return (
    <PageLayout
      title="Book a Safety Session"
      description="Choose a package, pick a time, and we'll be in touch to confirm."
      action={
        <Button variant="outline" size="sm" onClick={() => navigate('/bookings/my')}>
          <List className="h-4 w-4" />
          My Bookings
        </Button>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 max-w-2xl">

        {isError && (
          <Alert variant="error">
            Something went wrong. Please try again.
          </Alert>
        )}

        {/* ── Package selection ─────────────────────────────────────── */}
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">1. Select a package</h2>
            <p className="text-xs text-gray-500 mt-0.5">Choose the service that best fits your family's needs.</p>
          </div>
          <ServicePackagesSection
            packages={packages}
            isLoading={packagesLoading}
            selectedId={selectedPackageId}
            onSelect={handlePackageSelect}
            error={errors.packageId?.message}
          />
        </section>

        {/* ── Preferred date & time ─────────────────────────────────── */}
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">2. Preferred date &amp; time</h2>
            <p className="text-xs text-gray-500 mt-0.5">We'll confirm availability after you submit.</p>
          </div>
          <div className="relative max-w-xs">
            <CalendarDays className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id="preferredStartAt"
              type="datetime-local"
              {...register('preferredStartAt')}
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {errors.preferredStartAt && (
            <p className="text-sm text-red-600">{errors.preferredStartAt.message}</p>
          )}
        </section>

        {/* ── Channel ───────────────────────────────────────────────── */}
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">3. How would you like to connect?</h2>
            <p className="text-xs text-gray-500 mt-0.5">Online or in-person — your choice.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.keys(CHANNEL_CONFIG) as BookingChannel[]).map((ch) => {
              const config = CHANNEL_CONFIG[ch]
              return (
                <label
                  key={ch}
                  className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-gray-200 bg-white p-3 text-center transition has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50"
                >
                  <input type="radio" value={ch} {...register('channel')} className="sr-only" />
                  <span className="text-xl">{config.icon}</span>
                  <span className="text-xs font-medium text-gray-700">{config.label}</span>
                </label>
              )
            })}
          </div>
          {errors.channel && (
            <p className="text-sm text-red-600">{errors.channel.message}</p>
          )}
        </section>

        {/* ── Notes ────────────────────────────────────────────────── */}
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              4. Notes <span className="font-normal text-gray-400">(optional)</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Share anything helpful before the session.</p>
          </div>
          <textarea
            id="notes"
            rows={3}
            placeholder="e.g. We recently received a suspicious email and want advice…"
            {...register('notes')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.notes && (
            <p className="text-sm text-red-600">{errors.notes.message}</p>
          )}
        </section>

        {/* ── Actions ──────────────────────────────────────────────── */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/bookings/my')}>
            My Bookings
          </Button>
          <Button type="submit" loading={isPending}>
            Book Session
          </Button>
        </div>

      </form>
    </PageLayout>
  )
}
