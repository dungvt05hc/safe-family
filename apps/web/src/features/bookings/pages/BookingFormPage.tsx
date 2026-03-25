import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { useServicePackages } from '../hooks/useBookingQueries'
import { useCreateBooking } from '../hooks/useBookingMutations'
import { CHANNEL_CONFIG, type BookingChannel } from '../bookings.types'

const schema = z.object({
  packageId: z.string().uuid('Please select a package'),
  preferredStartAt: z.string().min(1, 'Please select a date and time'),
  channel: z.enum(['Online', 'Phone', 'Email'] as const, {
    errorMap: () => ({ message: 'Please select a contact method' }),
  }),
  notes: z.string().max(500, 'Notes must be 500 characters or fewer').optional(),
})

type FormValues = z.infer<typeof schema>

export function BookingFormPage() {
  const navigate = useNavigate()
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)

  const { data: packages, isLoading: packagesLoading } = useServicePackages()
  const { mutate: createBooking, isPending } = useCreateBooking()

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
    setValue('packageId', id)
  }

  function onSubmit(values: FormValues) {
    createBooking(
      {
        ...values,
        notes: values.notes ?? undefined,
      },
      {
        onSuccess: () => {
          navigate('/bookings/my')
        },
      },
    )
  }

  return (
    <PageLayout
      title="Book a Safety Session"
      description="Choose a package, pick a time, and we'll be in touch to confirm."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Package selection */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Select a Package
          </label>
          {packagesLoading ? (
            <p className="text-sm text-gray-500">Loading packages…</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {packages?.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => handlePackageSelect(pkg.id)}
                  className={`flex flex-col gap-2 rounded-lg border p-4 text-left transition ${
                    selectedPackageId === pkg.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-gray-900">{pkg.name}</span>
                    <span className="shrink-0 text-sm font-medium text-indigo-600">
                      {pkg.priceDisplay}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{pkg.description}</p>
                  <span className="text-xs text-gray-400">⏱ {pkg.durationLabel}</span>
                </button>
              ))}
            </div>
          )}
          {errors.packageId && (
            <p className="mt-1 text-sm text-red-600">{errors.packageId.message}</p>
          )}
        </div>

        {/* Date/time */}
        <div>
          <label
            htmlFor="preferredStartAt"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Preferred Date & Time
          </label>
          <input
            id="preferredStartAt"
            type="datetime-local"
            {...register('preferredStartAt')}
            className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.preferredStartAt && (
            <p className="mt-1 text-sm text-red-600">{errors.preferredStartAt.message}</p>
          )}
        </div>

        {/* Channel */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Contact Method
          </label>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(CHANNEL_CONFIG) as BookingChannel[]).map((ch) => {
              const config = CHANNEL_CONFIG[ch]
              return (
                <label
                  key={ch}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50"
                >
                  <input
                    type="radio"
                    value={ch}
                    {...register('channel')}
                    className="sr-only"
                  />
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </label>
              )
            })}
          </div>
          {errors.channel && (
            <p className="mt-1 text-sm text-red-600">{errors.channel.message}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Notes{' '}
            <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Any additional context or questions…"
            {...register('notes')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/bookings/my')}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            My Bookings
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? 'Booking…' : 'Book Session'}
          </button>
        </div>
      </form>
    </PageLayout>
  )
}
