import { useState, type ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
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

// ── Visual-only static data (all text comes from i18n) ────────────────────
type UrgencyColor = { border: string; bg: string; text: string; icon: string }
const URGENCY_STATICS: {
  value: BookingUrgency
  icon: ComponentType<{ className?: string }>
  color: UrgencyColor
}[] = [
  { value: 'Routine',  icon: Clock,        color: { border: 'border-blue-400',  bg: 'bg-blue-50',  text: 'text-blue-900',  icon: 'text-blue-500'  } },
  { value: 'Urgent',   icon: AlertTriangle, color: { border: 'border-amber-400', bg: 'bg-amber-50', text: 'text-amber-900', icon: 'text-amber-500' } },
  { value: 'Critical', icon: ShieldAlert,   color: { border: 'border-red-400',   bg: 'bg-red-50',   text: 'text-red-900',   icon: 'text-red-500'   } },
]

const HOW_IT_WORKS_ICONS: ComponentType<{ className?: string }>[] = [CreditCard, FileText, Download]

const DELIVERABLE_ICONS: Record<string, ComponentType<{ className?: string }>[]> = {
  'FREE-CHECK':    [FileText,  CheckCircle2, LayoutList],
  'FAMILY-CORE':   [FileText,  LayoutList,   CheckCircle2],
  'INCIDENT-RESP': [Download,  LayoutList,   FileText],
  'ANNUAL-PLAN':   [FileText,  Package,      Download],
}

const CODE_TO_DELIVERABLE_KEY: Record<string, 'freeCheck' | 'familyCore' | 'incidentResp' | 'annualPlan'> = {
  'FREE-CHECK':    'freeCheck',
  'FAMILY-CORE':   'familyCore',
  'INCIDENT-RESP': 'incidentResp',
  'ANNUAL-PLAN':   'annualPlan',
}

export function BookingFormPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('bookings')
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
      title={t('form.title')}
      description={t('form.description')}
      action={
        <Button variant="outline" size="sm" onClick={() => navigate('/bookings/my')}>
          <List className="h-4 w-4" />
          {t('form.myBookings')}
        </Button>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 max-w-2xl mx-auto">

        {isError && (
          <Alert variant="error">
            {t('form.errorGeneric')}
          </Alert>
        )}

        {/* ── 1. Package ─────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">{t('form.step1.title')}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('form.step1.description')}
            </p>
          </div>
          <ServicePackagesSection
            packages={packages}
            isLoading={packagesLoading}
            selectedId={selectedPackageId}
            onSelect={handlePackageSelect}
            error={errors.packageId ? t('form.validation.selectPackage') : undefined}
          />
        </section>

        {/* ── 2. Help topic ──────────────────────────────────────────── */}
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">{t('form.step2.title')}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('form.step2.description')}
            </p>
          </div>

          {/* Quick-select tags */}
          <div className="flex flex-wrap gap-2">
            {(t('helpTopics', { returnObjects: true }) as string[]).map((topic) => (
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
              placeholder={t('form.step2.placeholder')}
              value={(t('helpTopics', { returnObjects: true }) as string[]).includes(watchedHelpTopic ?? '') ? '' : (watchedHelpTopic ?? '')}
              onChange={(e) => setValue('helpTopic', e.target.value, { shouldValidate: true })}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {errors.helpTopic && (
            <p className="text-sm text-red-600">{t('form.validation.helpTopicRequired')}</p>
          )}
        </section>

        {/* ── 3. Urgency ─────────────────────────────────────────────── */}
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">{t('form.step3.title')}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('form.step3.description')}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {URGENCY_STATICS.map(({ value, icon: Icon, color }) => {
              const urgencyKey = value.toLowerCase() as 'routine' | 'urgent' | 'critical'
              const label = t(`urgency.${urgencyKey}.label`)
              const body  = t(`urgency.${urgencyKey}.body`)
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
              {t('form.step4.title')}{' '}
              <span className="font-normal text-gray-400">{t('form.step4.optional')}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('form.step4.description')}
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
              placeholder={t('form.step4.placeholder')}
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
              <span className="font-normal text-gray-400">{t('form.step5.optional')}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('form.step5.description')}
            </p>
          </div>
          <div className="relative max-w-sm">
            <Smartphone className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('form.step5.placeholder')}
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
              <span className="font-normal text-gray-400">{t('form.step6.optional')}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('form.step6.description')}
            </p>
          </div>
          <textarea
            rows={4}
            placeholder={t('form.step6.placeholder')}
            {...register('customerNotes')}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400">
            {t('form.step6.tip')}
          </p>
          {errors.customerNotes && (
            <p className="text-sm text-red-600">{t('form.validation.notesLength')}</p>
          )}
        </section>

        {/* ── Booking summary ────────────────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">{t('form.summary.title')}</h2>
            {selectedPackage && watchedHelpTopic && watchedUrgency && (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t('form.summary.readyToSubmit')}
              </span>
            )}
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <SummaryLine
              icon={Package}
              label={t('form.summary.package')}
              value={selectedPackage?.name ?? null}
              placeholder={t('form.whatsUnlocked.notSelectedYet')}
            />
            <SummaryLine
              icon={Tag}
              label={t('form.summary.helpTopic')}
              value={watchedHelpTopic || null}
              placeholder={t('form.whatsUnlocked.notSelectedYet')}
            />
            <SummaryLine
              icon={
                watchedUrgency === 'Critical' ? ShieldAlert :
                watchedUrgency === 'Urgent'   ? AlertTriangle : Clock
              }
              label={t('form.summary.urgency')}
              value={
                watchedUrgency
                  ? t(`urgency.${watchedUrgency.toLowerCase() as 'routine' | 'urgent' | 'critical'}.label`)
                  : null
              }
              placeholder={t('form.whatsUnlocked.notSelectedYet')}
            />
            <SummaryLine
              icon={Download}
              label={t('form.summary.delivery')}
              value={selectedPackage?.durationLabel ?? null}
              placeholder={t('form.whatsUnlocked.notSelectedYet')}
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
                <span className="text-sm font-semibold text-gray-700">{t('form.summary.totalDue')}</span>
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
          <h2 className="text-sm font-semibold text-gray-800">{t('form.whatsUnlocked.title')}</h2>

          {/* Package-specific deliverables */}
          {selectedPackage ? (
            <div className="overflow-hidden rounded-xl border border-blue-100 bg-blue-50/40">
              <p className="border-b border-blue-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-blue-600">
                {t('form.whatsUnlocked.includedWith', { name: selectedPackage.name })}
              </p>
              <ul className="divide-y divide-blue-50 px-4">
                {(() => {
                  const key = CODE_TO_DELIVERABLE_KEY[selectedPackage.code]
                  const labels = key ? (t(`deliverables.${key}`, { returnObjects: true }) as string[]) : []
                  const icons  = DELIVERABLE_ICONS[selectedPackage.code] ?? []
                  return labels.map((label, i) => {
                    const Icon = icons[i]
                    return (
                      <li key={i} className="flex items-center gap-3 py-3">
                        {Icon && <Icon className="h-4 w-4 shrink-0 text-blue-500" />}
                        <span className="text-sm text-gray-800">{label}</span>
                      </li>
                    )
                  })
                })()}
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-4">
              <Package className="h-5 w-5 shrink-0 text-gray-300" />
              <p className="text-sm italic text-gray-400">{t('form.whatsUnlocked.selectPrompt')}</p>
            </div>
          )}

          {/* How it works */}
          <ol className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
            {HOW_IT_WORKS_ICONS.map((Icon, i) => {
              const steps = t('howItWorks', { returnObjects: true }) as Array<{ title: string; body: string }>
              const step = steps[i]
              return (
                <li
                  key={i}
                  className={cn(
                    'flex items-start gap-4 px-4 py-4',
                    i < HOW_IT_WORKS_ICONS.length - 1 && 'border-b border-gray-100',
                  )}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold leading-none text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                      <p className="text-sm font-semibold text-gray-800">{step.title}</p>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{step.body}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>

        {/* ── Submit ─────────────────────────────────────────────────── */}
        <div className="flex gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/bookings/my')}>
            {t('form.myBookings')}
          </Button>
          <Button type="submit" loading={isPending}>
            {isFree ? t('form.submit.free') : t('form.submit.paid')}
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
  placeholder,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  /** Pass null to show the unfilled placeholder. */
  value: string | null
  placeholder: string
}) {
  const filled = value !== null
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-0">
      <Icon className={cn('h-4 w-4 shrink-0', filled ? 'text-blue-500' : 'text-gray-300')} />
      <span className="w-28 shrink-0 text-xs text-gray-500">{label}</span>
      {filled ? (
        <span className="truncate text-sm font-medium text-gray-900">{value}</span>
      ) : (
        <span className="text-sm italic text-gray-300">{placeholder}</span>
      )}
    </div>
  )
}
