import { useEffect, type ComponentType } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation, type TFunction } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  ShieldCheck, FileText, Download, LayoutList, Package,
  Clock, CheckCircle2, LayoutDashboard,
} from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button, LoadingState, Card, CardContent } from '@/components/ui'
import { fadeUpVariants } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { useBooking } from '../hooks/useBookingQueries'

// ─── Per-package unlock metadata ──────────────────────────────────────────────

interface UnlockMeta {
  headline: string
  body: string
  deliveryEstimate: string
  deliverables: { icon: ComponentType<{ className?: string }>; label: string }[]
  ctas: { icon: ComponentType<{ className?: string }>; label: string; path: string; primary?: boolean }[]
}

function getUnlockMeta(packageCode: string, t: TFunction<'payments'>): UnlockMeta {
  switch (packageCode) {
    case 'FREE-CHECK':
      return {
        headline:         t('unlock.freeCheck.headline'),
        body:             t('unlock.freeCheck.body'),
        deliveryEstimate: t('unlock.freeCheck.deliveryEstimate'),
        deliverables: [
          { icon: FileText,     label: t('unlock.freeCheck.deliverable0') },
          { icon: CheckCircle2, label: t('unlock.freeCheck.deliverable1') },
          { icon: LayoutList,   label: t('unlock.freeCheck.deliverable2') },
        ],
        ctas: [
          { icon: FileText,   label: t('unlock.freeCheck.cta0'), path: '/reports',    primary: true },
          { icon: LayoutList, label: t('unlock.freeCheck.cta1'), path: '/checklists' },
        ],
      }
    case 'FAMILY-CORE':
      return {
        headline:         t('unlock.familyCore.headline'),
        body:             t('unlock.familyCore.body'),
        deliveryEstimate: t('unlock.familyCore.deliveryEstimate'),
        deliverables: [
          { icon: FileText,     label: t('unlock.familyCore.deliverable0') },
          { icon: LayoutList,   label: t('unlock.familyCore.deliverable1') },
          { icon: CheckCircle2, label: t('unlock.familyCore.deliverable2') },
        ],
        ctas: [
          { icon: FileText,   label: t('unlock.familyCore.cta0'), path: '/reports',    primary: true },
          { icon: LayoutList, label: t('unlock.familyCore.cta1'), path: '/checklists' },
        ],
      }
    case 'INCIDENT-RESP':
      return {
        headline:         t('unlock.incidentResp.headline'),
        body:             t('unlock.incidentResp.body'),
        deliveryEstimate: t('unlock.incidentResp.deliveryEstimate'),
        deliverables: [
          { icon: Download,   label: t('unlock.incidentResp.deliverable0') },
          { icon: LayoutList, label: t('unlock.incidentResp.deliverable1') },
          { icon: FileText,   label: t('unlock.incidentResp.deliverable2') },
        ],
        ctas: [
          { icon: FileText,   label: t('unlock.incidentResp.cta0'), path: '/reports',    primary: true },
          { icon: LayoutList, label: t('unlock.incidentResp.cta1'), path: '/checklists' },
        ],
      }
    case 'ANNUAL-PLAN':
      return {
        headline:         t('unlock.annualPlan.headline'),
        body:             t('unlock.annualPlan.body'),
        deliveryEstimate: t('unlock.annualPlan.deliveryEstimate'),
        deliverables: [
          { icon: FileText,  label: t('unlock.annualPlan.deliverable0') },
          { icon: Package,   label: t('unlock.annualPlan.deliverable1') },
          { icon: Download,  label: t('unlock.annualPlan.deliverable2') },
        ],
        ctas: [
          { icon: FileText,   label: t('unlock.annualPlan.cta0'), path: '/reports',    primary: true },
          { icon: LayoutList, label: t('unlock.annualPlan.cta1'), path: '/checklists' },
        ],
      }
    default:
      return {
        headline:         t('unlock.defaultPkg.headline'),
        body:             t('unlock.defaultPkg.body'),
        deliveryEstimate: t('unlock.defaultPkg.deliveryEstimate'),
        deliverables: [
          { icon: FileText, label: t('unlock.defaultPkg.deliverable0') },
        ],
        ctas: [
          { icon: FileText, label: t('unlock.defaultPkg.cta0'), path: '/reports', primary: true },
        ],
      }
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export function PaymentUnlockPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation('payments')
  const { data: booking, isLoading } = useBooking(id)

  // Guard: only paid or free bookings should see this page.
  useEffect(() => {
    if (!booking) return
    const isEligible = booking.packagePrice === 0 || booking.paymentStatus === 'Paid'
    if (!isEligible) {
      navigate(`/bookings/${id}`, { replace: true })
    }
  }, [booking, id, navigate])

  if (isLoading || !booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingState />
      </div>
    )
  }

  const meta   = getUnlockMeta(booking.packageCode, t)
  const isFree = booking.packagePrice === 0

  return (
    <PageLayout
      title={t('unlock.pageTitle')}
      description={t('unlock.pageDescription')}
    >
      <div className="max-w-lg space-y-6">

        {/* ── Hero success banner ────────────────────────────────────── */}
        <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" custom={0}>
          <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-6 text-center">
            <div className="mb-4 flex justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <ShieldCheck className="h-8 w-8 text-green-600" />
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-1">
              {isFree ? t('unlock.allSet') : t('unlock.paymentConfirmed')}
            </p>
            <h1 className="text-xl font-bold text-gray-900">
              {meta.headline}
            </h1>
          </div>
        </motion.div>

        {/* ── Order summary card ─────────────────────────────────────── */}
        <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" custom={1}>
          <Card>
            <CardContent className="space-y-4">

              {/* Package name + price badge */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{booking.packageName}</p>
                  {booking.helpTopic && (
                    <p className="mt-0.5 text-sm text-gray-500">{t('unlock.helpTopicPrefix', { topic: booking.helpTopic })}</p>
                  )}
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    isFree
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700',
                  )}
                >
                  {isFree
                    ? t('unlock.free')
                    : `${booking.packageCurrency} ${booking.packagePrice.toLocaleString()}`}
                </span>
              </div>

              <hr className="border-gray-100" />

              {/* Deliverables */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t('unlock.whatYouReceive')}
                </p>
                <ul className="space-y-2.5">
                  {meta.deliverables.map(({ icon: Icon, label }, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <Icon className="h-3.5 w-3.5 text-blue-500" />
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>
              </div>

              <hr className="border-gray-100" />

              {/* Delivery estimate */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 shrink-0 text-gray-400" />
                <span>{meta.deliveryEstimate}</span>
              </div>

            </CardContent>
          </Card>
        </motion.div>

        {/* ── What happens next ──────────────────────────────────────── */}
        <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" custom={2}>
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-relaxed text-blue-800">
            <p className="mb-1 font-semibold">{t('unlock.whatsNext')}</p>
            <p>{meta.body}</p>
            <p className="mt-2 text-blue-600">
              {t('unlock.emailNotice')}
            </p>
          </div>
        </motion.div>

        {/* ── CTA buttons ────────────────────────────────────────────── */}
        <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" custom={3}>
          <div className="flex flex-wrap gap-3">
            {meta.ctas.map(({ icon: Icon, label, path, primary }, i) => (
              <Button
                key={i}
                variant={primary ? 'primary' : 'outline'}
                onClick={() => navigate(path)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <LayoutDashboard className="h-4 w-4" />
              {t('unlock.dashboard')}
            </Button>
          </div>
        </motion.div>

        {/* ── Order reference ────────────────────────────────────────── */}
        <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" custom={4}>
          <p className="text-center text-xs text-gray-400">
            {t('unlock.orderReference')}{' '}
            <Link
              to={`/bookings/${id}`}
              className="font-mono text-gray-500 hover:text-gray-700 hover:underline"
            >
              {id}
            </Link>
            {' · '}
            <button
              type="button"
              onClick={() => navigate('/bookings/my')}
              className="text-gray-500 hover:text-gray-700 hover:underline"
            >
              {t('unlock.viewAllOrders')}
            </button>
          </p>
        </motion.div>

      </div>
    </PageLayout>
  )
}
