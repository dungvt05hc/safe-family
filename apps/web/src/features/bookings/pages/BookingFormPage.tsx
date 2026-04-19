import { useState, type ComponentType } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import {
  List, FileText, Package, Clock, CreditCard, CheckCircle2,
  AlertTriangle, ShieldAlert, Tag, Smartphone, LayoutList, Download,
  User2, Users,
} from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button, Alert } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useServicePackages } from '../hooks/useBookingQueries'
import { useCreateBooking } from '../hooks/useBookingMutations'
import type { BookingUrgency } from '../bookings.types'
import { ServicePackagesSection } from '../components/ServicePackagesSection'
import { useFamilyMembers } from '@/features/families/hooks/useFamilyMembers'

const schema = z.object({
  packageId:      z.string().uuid('Please select a package'),
  helpTopic:      z.string().min(1, 'Please tell us what you need help with').max(200),
  urgency:        z.enum(['Routine', 'Urgent', 'Critical'] as const),
  affectedMember: z.string().max(100).optional(),
  affectedTarget: z.string().max(200).optional(),
  customerNotes:  z.string().max(1000, 'Notes must be 1000 characters or fewer').optional(),
})

type FormValues = z.infer<typeof schema>

const HELP_TOPICS: string[] = [
  'Account security & passwords',
  'Phishing or suspicious messages',
  'Data breach or leaked information',
  'Social media safety',
  'Device security & malware',
  'Online scams & fraud',
  'Child online safety',
  'Privacy settings',
  'Identity theft',
]

const URGENCY_OPTIONS: {
  value: BookingUrgency
  icon: ComponentType<{ className?: string }>
  label: string
  body: string
  color: { border: string; bg: string; text: string; icon: string }
}[] = [
  {
    value: 'Routine',
    icon:  Clock,
    label: 'No rush',
    body:  "I'd like to improve our safety, but there's no immediate threat.",
    color: { border: 'border-blue-400', bg: 'bg-blue-50', text: 'text-blue-900', icon: 'text-blue-500' },
  },
  {
    value: 'Urgent',
    icon:  AlertTriangle,
    label: 'Needs attention',
    body:  'Something concerning has happened recently and I want to sort it out.',
    color: { border: 'border-amber-400', bg: 'bg-amber-50', text: 'text-amber-900', icon: 'text-amber-500' },
  },
  {
    value: 'Critical',
    icon:  ShieldAlert,
    label: 'Active issue — urgent',
    body:  "We're dealing with an active problem right now and need immediate guidance.",
    color: { border: 'border-red-400', bg: 'bg-red-50', text: 'text-red-900', icon: 'text-red-500' },
  },
]

const HOW_IT_WORKS: { Icon: ComponentType<{ className?: string }>; title: string; body: string }[] = [
  {
    Icon: CreditCard,
    title: 'Pay securely',
    body:  'Your payment is processed via our secure gateway. Free packages skip this step entirely.',
  },
  {
    Icon: FileText,
    title: 'We prepare your materials',
    body:  'Our advisors review your details and personalise your plan or pack — usually within 1 business day.',
  },
  {
    Icon: Download,
    title: 'Access your content',
    body:  "Your safety materials are delivered to your account and inbox as soon as they're ready.",
  },
]

const PACKAGE_DELIVERABLES: Record<string, { icon: ComponentType<{ className?: string }>; label: string }[]> = {
  'FREE-CHECK': [
    { icon: FileText,     label: 'Digital security summary report' },
    { icon: CheckCircle2, label: '3 personalised action items' },
    { icon: LayoutList,   label: 'Starter safety checklist' },
  ],
  'FAMILY-CORE': [
    { icon: FileText,     label: 'Personalised family safety plan (PDF)' },
    { icon: LayoutList,   label: 'Premium interactive safety checklist' },
    { icon: CheckCircle2, label: 'Password & account audit results' },
  ],
  'INCIDENT-RESP': [
    { icon: Download,     label: 'Incident recovery pack (step-by-step guide)' },
    { icon: LayoutList,   label: 'Threat containment checklist' },
    { icon: FileText,     label: 'Follow-up action plan & monitoring guide' },
  ],
  'ANNUAL-PLAN': [
    { icon: FileText,     label: '4× quarterly safety plan updates' },
    { icon: Package,      label: 'Priority incident response (24h SLA)' },
    { icon: Download,     label: 'Full family security roadmap (PDF)' },
  ],
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
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { urgency: 'Routine' },
  })

  const { data: familyMembers } = useFamilyMembers()

  const watchedHelpTopic     = watch('helpTopic')
  const watchedUrgency       = watch('urgency')
  const watchedAffectedMember = watch('affectedMember')
  const selectedPackage       = packages?.find((p) => p.id === selectedPackageId)
  const isFree                = selectedPackage?.priceDisplay?.toLowerCase() === 'free'

  function handlePackageSelect(id: string) {
    setSelectedPackageId(id)
    setValue('packageId', id, { shouldValidate: true })
  }

  function onSubmit(values: FormValues) {
    createBooking(
      {
        packageId:      values.packageId,
        helpTopic:      values.helpTopic,
        urgency:        values.urgency,
        affectedMember: values.affectedMember || undefined,
        affectedTarget: values.affectedTarget || undefined,
        customerNotes:  values.customerNotes  || undefined,
      },
      {
        onSuccess: (booking) =>
          // Free packages are auto-confirmed — go straight to the unlock page.
          // Paid packages need payment first — go to booking details where payment is initiated.
          navigate(
            booking.packagePrice === 0
              ? `/bookings/${booking.id}/unlocked`
              : `/bookings/${booking.id}`,
          ),
      },
    )
  }

  return (
    <PageLayout
      title="Get Personalized Safety Help"
      description="Choose a plan, tell us what's happening, and we'll prepare your personalised safety materials."
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

        {/* ── 1. Package ─────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">1. Choose your safety package</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Each package unlocks a different set of digital safety materials — pick the one that fits your situation.
            </p>
          </div>
          <ServicePackagesSection
            packages={packages}
            isLoading={packagesLoading}
            selectedId={selectedPackageId}
            onSelect={handlePackageSelect}
            error={errors.packageId?.message}
          />
        </section>

        {/* ── 2. Help topic ──────────────────────────────────────────── */}
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">2. What do you need help with?</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Pick the closest match — this helps us personalise your safety materials.
            </p>
          </div>

          {/* Quick-select tags */}
          <div className="flex flex-wrap gap-2">
            {HELP_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setValue('helpTopic', topic, { shouldValidate: true })}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm transition-all',
                  watchedHelpTopic === topic
                    ? 'border-blue-500 bg-blue-50 font-medium text-blue-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm',
                )}
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Custom free-text fallback */}
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              type="text"
              placeholder="Or describe it in your own words…"
              value={HELP_TOPICS.includes(watchedHelpTopic ?? '') ? '' : (watchedHelpTopic ?? '')}
              onChange={(e) => setValue('helpTopic', e.target.value, { shouldValidate: true })}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {errors.helpTopic && (
            <p className="text-sm text-red-600">{errors.helpTopic.message}</p>
          )}
        </section>

        {/* ── 3. Urgency ─────────────────────────────────────────────── */}
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">3. How urgent is this?</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              This helps us prioritise your request and tailor the tone of your materials.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {URGENCY_OPTIONS.map(({ value, icon: Icon, label, body, color }) => {
              const isChecked = watchedUrgency === value
              return (
                <label
                  key={value}
                  className={cn(
                    'flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-4 transition-all',
                    isChecked
                      ? `${color.border} ${color.bg} shadow-sm`
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
                  )}
                >
                  <input type="radio" value={value} {...register('urgency')} className="sr-only" />
                  <Icon className={cn('h-5 w-5', isChecked ? color.icon : 'text-gray-300')} />
                  <div>
                    <p className={cn('text-sm font-semibold leading-snug', isChecked ? color.text : 'text-gray-900')}>
                      {label}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{body}</p>
                  </div>
                </label>
              )
            })}
          </div>
          {errors.urgency && (
            <p className="text-sm text-red-600">{errors.urgency.message}</p>
          )}
        </section>

        {/* ── 4. Affected member ─────────────────────────────────────── */}
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              4. Who is affected?{' '}
              <span className="font-normal text-gray-400">(optional)</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Which family member does this situation primarily involve?
            </p>
          </div>

          {/* Member pills from family roster */}
          {familyMembers && familyMembers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {familyMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() =>
                    setValue(
                      'affectedMember',
                      watchedAffectedMember === member.displayName ? '' : member.displayName,
                      { shouldValidate: true },
                    )
                  }
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all',
                    watchedAffectedMember === member.displayName
                      ? 'border-blue-500 bg-blue-50 font-medium text-blue-700 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm',
                  )}
                >
                  <User2 className="h-3.5 w-3.5 shrink-0" />
                  {member.displayName}
                </button>
              ))}
            </div>
          )}

          {/* Free-text fallback */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              type="text"
              placeholder="Or type a name…"
              value={
                familyMembers?.some((m) => m.displayName === (watchedAffectedMember ?? ''))
                  ? ''
                  : (watchedAffectedMember ?? '')
              }
              onChange={(e) =>
                setValue('affectedMember', e.target.value, { shouldValidate: true })
              }
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {errors.affectedMember && (
            <p className="text-sm text-red-600">{errors.affectedMember.message}</p>
          )}
        </section>

        {/* ── 5. Affected account / device ───────────────────────────── */}
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              5. Which account or device is affected?{' '}
              <span className="font-normal text-gray-400">(optional)</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              e.g. "Dad's Gmail", "Family iPad", "Instagram account". Helps us target our advice.
            </p>
          </div>
          <div className="relative max-w-sm">
            <Smartphone className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="e.g. Mum's iPhone, Netflix account…"
              {...register('affectedTarget')}
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {errors.affectedTarget && (
            <p className="text-sm text-red-600">{errors.affectedTarget.message}</p>
          )}
        </section>

        {/* ── 5. Notes ───────────────────────────────────────────────── */}
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              6. Anything else we should know?{' '}
              <span className="font-normal text-gray-400">(optional)</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              The more context you share, the more targeted your materials will be.
            </p>
          </div>
          <textarea
            rows={4}
            placeholder="e.g. We received a suspicious email last week. Our teenager has also been getting strange messages on Instagram…"
            {...register('customerNotes')}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400">
            Tip: describe what happened, when, and who in your family is affected.
          </p>
          {errors.customerNotes && (
            <p className="text-sm text-red-600">{errors.customerNotes.message}</p>
          )}
        </section>

        {/* ── Booking summary ────────────────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Your order at a glance</h2>
            {selectedPackage && watchedHelpTopic && watchedUrgency && (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Ready to submit
              </span>
            )}
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <SummaryLine
              icon={Package}
              label="Package"
              value={selectedPackage?.name ?? null}
            />
            <SummaryLine
              icon={Tag}
              label="Help topic"
              value={watchedHelpTopic || null}
            />
            <SummaryLine
              icon={
                watchedUrgency === 'Critical' ? ShieldAlert :
                watchedUrgency === 'Urgent'   ? AlertTriangle : Clock
              }
              label="Urgency"
              value={
                watchedUrgency
                  ? (URGENCY_OPTIONS.find((u) => u.value === watchedUrgency)?.label ?? watchedUrgency)
                  : null
              }
            />
            <SummaryLine
              icon={Download}
              label="Delivery"
              value={selectedPackage?.durationLabel ?? null}
            />
            {/* Price footer */}
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <CreditCard
                  className={cn(
                    'h-4 w-4 shrink-0',
                    selectedPackage ? 'text-blue-500' : 'text-gray-300',
                  )}
                />
                <span className="text-sm font-semibold text-gray-700">Total due</span>
              </div>
              <span
                className={cn(
                  'text-base font-bold',
                  !selectedPackage
                    ? 'text-gray-300'
                    : selectedPackage.priceDisplay === 'Free'
                      ? 'text-green-600'
                      : 'text-gray-900',
                )}
              >
                {selectedPackage?.priceDisplay ?? '—'}
              </span>
            </div>
          </div>
        </section>

        {/* ── What you'll unlock ──────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-800">What you'll unlock</h2>

          {/* Package-specific deliverables */}
          {selectedPackage ? (
            <div className="overflow-hidden rounded-xl border border-blue-100 bg-blue-50/40">
              <p className="border-b border-blue-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-blue-600">
                Included with {selectedPackage.name}
              </p>
              <ul className="divide-y divide-blue-50 px-4">
                {(PACKAGE_DELIVERABLES[selectedPackage.code] ?? []).map(({ icon: Icon, label }, i) => (
                  <li key={i} className="flex items-center gap-3 py-3">
                    <Icon className="h-4 w-4 shrink-0 text-blue-500" />
                    <span className="text-sm text-gray-800">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-4">
              <Package className="h-5 w-5 shrink-0 text-gray-300" />
              <p className="text-sm italic text-gray-400">Select a package above to see what you'll unlock.</p>
            </div>
          )}

          {/* How it works */}
          <ol className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
            {HOW_IT_WORKS.map(({ Icon, title, body }, i) => (
              <li
                key={i}
                className={cn(
                  'flex items-start gap-4 px-4 py-4',
                  i < HOW_IT_WORKS.length - 1 && 'border-b border-gray-100',
                )}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold leading-none text-white">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                    <p className="text-sm font-semibold text-gray-800">{title}</p>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Submit ─────────────────────────────────────────────────── */}
        <div className="flex gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/bookings/my')}>
            My Bookings
          </Button>
          <Button type="submit" loading={isPending}>
            {isFree ? 'Unlock My Plan' : 'Continue to Payment'}
          </Button>
        </div>

      </form>
    </PageLayout>
  )
}

// ─── Summary line helper ─────────────────────────────────────────────────────

function SummaryLine({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  /** Pass null to show the unfilled placeholder. */
  value: string | null
}) {
  const filled = value !== null
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-0">
      <Icon className={cn('h-4 w-4 shrink-0', filled ? 'text-blue-500' : 'text-gray-300')} />
      <span className="w-28 shrink-0 text-xs text-gray-500">{label}</span>
      {filled ? (
        <span className="truncate text-sm font-medium text-gray-900">{value}</span>
      ) : (
        <span className="text-sm italic text-gray-300">Not selected yet</span>
      )}
    </div>
  )
}
