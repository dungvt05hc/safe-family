import { useEffect, type ComponentType } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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

const UNLOCK_META: Record<string, UnlockMeta> = {
  'FREE-CHECK': {
    headline:         'Your free safety report is on its way',
    body:             "Our team has received your request and will prepare a summary of your top security gaps and personalised action items. You'll receive a notification when it's ready in your reports.",
    deliveryEstimate: 'Ready shortly',
    deliverables: [
      { icon: FileText,     label: 'Digital security summary report' },
      { icon: CheckCircle2, label: '3 personalised action items' },
      { icon: LayoutList,   label: 'Starter safety checklist' },
    ],
    ctas: [
      { icon: FileText,    label: 'View my reports',  path: '/reports',    primary: true },
      { icon: LayoutList,  label: 'View checklist',   path: '/checklists' },
    ],
  },
  'FAMILY-CORE': {
    headline:         'Your Family Safety Plan is being prepared',
    body:             'Our advisors are reviewing your details and building a personalised family safety plan. Your PDF report and interactive checklist will be delivered within 24 hours.',
    deliveryEstimate: 'Ready within 24 hours',
    deliverables: [
      { icon: FileText,     label: 'Personalised family safety plan (PDF)' },
      { icon: LayoutList,   label: 'Premium interactive safety checklist' },
      { icon: CheckCircle2, label: 'Password & account audit results' },
    ],
    ctas: [
      { icon: FileText,    label: 'View my reports',  path: '/reports',    primary: true },
      { icon: LayoutList,  label: 'View checklist',   path: '/checklists' },
    ],
  },
  'INCIDENT-RESP': {
    headline:         'Your Incident Recovery Pack is being prepared',
    body:             "We're treating this as a priority. Your step-by-step recovery guide and containment checklist will be delivered within 12 hours. If our team needs to reach you urgently, we may be in touch.",
    deliveryEstimate: 'Priority — ready within 12 hours',
    deliverables: [
      { icon: Download,     label: 'Step-by-step incident recovery pack' },
      { icon: LayoutList,   label: 'Threat containment checklist' },
      { icon: FileText,     label: 'Follow-up monitoring guide' },
    ],
    ctas: [
      { icon: FileText,    label: 'View my reports',  path: '/reports',    primary: true },
      { icon: LayoutList,  label: 'View checklist',   path: '/checklists' },
    ],
  },
  'ANNUAL-PLAN': {
    headline:         'Your Annual Safety Plan is being set up',
    body:             "Our advisors are building your family's personalised security roadmap. Your first quarterly safety plan and priority incident response access will be ready within 24 hours.",
    deliveryEstimate: 'Ready within 24 hours',
    deliverables: [
      { icon: FileText,   label: '4× quarterly safety plan updates' },
      { icon: Package,    label: 'Priority incident response (24h SLA)' },
      { icon: Download,   label: 'Full family security roadmap (PDF)' },
    ],
    ctas: [
      { icon: FileText,    label: 'View my reports',  path: '/reports',    primary: true },
      { icon: LayoutList,  label: 'View checklist',   path: '/checklists' },
    ],
  },
}

const DEFAULT_UNLOCK: UnlockMeta = {
  headline:         'Your safety materials are being prepared',
  body:             'Our advisors are reviewing your submission and will deliver your personalised safety materials shortly.',
  deliveryEstimate: 'Coming soon',
  deliverables: [
    { icon: FileText, label: 'Safety materials' },
  ],
  ctas: [
    { icon: FileText, label: 'View my reports', path: '/reports', primary: true },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────

export function PaymentUnlockPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
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

  const meta   = UNLOCK_META[booking.packageCode] ?? DEFAULT_UNLOCK
  const isFree = booking.packagePrice === 0

  return (
    <PageLayout
      title="Payment Successful"
      description="Your digital safety product has been unlocked"
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
              {isFree ? 'All set' : 'Payment confirmed'}
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
                    <p className="mt-0.5 text-sm text-gray-500">Re: {booking.helpTopic}</p>
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
                    ? 'Free'
                    : `${booking.packageCurrency} ${booking.packagePrice.toLocaleString()}`}
                </span>
              </div>

              <hr className="border-gray-100" />

              {/* Deliverables */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  What you'll receive
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
            <p className="mb-1 font-semibold">What happens next</p>
            <p>{meta.body}</p>
            <p className="mt-2 text-blue-600">
              We'll notify you by email as soon as your materials are available.
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
              Dashboard
            </Button>
          </div>
        </motion.div>

        {/* ── Order reference ────────────────────────────────────────── */}
        <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" custom={4}>
          <p className="text-center text-xs text-gray-400">
            Order reference:{' '}
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
              View all orders
            </button>
          </p>
        </motion.div>

      </div>
    </PageLayout>
  )
}
