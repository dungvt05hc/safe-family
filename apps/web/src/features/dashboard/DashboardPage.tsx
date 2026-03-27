import { motion } from 'framer-motion'
import {
  Users,
  CreditCard,
  Smartphone,
  AlertTriangle,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { ApiError } from '@/types/api'
import { useDashboard } from './dashboard.hooks'
import { SummaryCard }      from './components/SummaryCard'
import { RiskScoreCard }    from './components/RiskScoreCard'
import { QuickActions }     from './components/QuickActions'
import { ImmediateActions } from './components/ImmediateActions'
import { RecentActivity }   from './components/RecentActivity'
import { useCurrentUser }   from '@/features/auth/hooks/useCurrentUser'

// ── No-family state ───────────────────────────────────────────────────────────

function NoFamilyBanner() {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50 px-8 py-16 text-center"
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 mb-4">
        <ShieldOff className="w-8 h-8 text-blue-500" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">Set up your family profile</h2>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        Create a family to start tracking your digital safety, manage members, devices, accounts, and more.
      </p>
      <button
        onClick={() => navigate('/family/new')}
        className="rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors px-6 py-2.5 text-sm font-semibold text-white shadow-sm"
      >
        Create Family →
      </button>
    </motion.div>
  )
}

// ── Error state ───────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
      <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p className="text-sm text-red-700">{message}</p>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

/**
 * DashboardPage — aggregates all family safety data from a single `GET /api/dashboard`
 * endpoint and renders summary cards, risk score, quick actions, immediate actions,
 * and recent activity.
 */
export function DashboardPage() {
  const { data: user }                      = useCurrentUser()
  const { data, isLoading, isError, error } = useDashboard()

  // ── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[0, 1, 2, 3].map((n) => (
            <div key={n} className="h-24 rounded-2xl border border-gray-100 bg-white animate-pulse" />
          ))}
        </div>
        <LoadingState />
      </div>
    )
  }

  // ── No family (403) ──────────────────────────────────────────────────────

  if (isError && error instanceof ApiError && error.isForbidden) {
    return (
      <div className="space-y-6">
        <WelcomeBanner displayName={user?.displayName} hasFamily={false} />
        <NoFamilyBanner />
      </div>
    )
  }

  // ── Generic error ────────────────────────────────────────────────────────

  if (isError) {
    const msg = error instanceof ApiError ? error.message : 'Failed to load dashboard. Please try again.'
    return <ErrorBanner message={msg} />
  }

  // ── No data guard (shouldn't happen after loading) ───────────────────────
  if (!data) return null

  const { family, riskSummary, counts, immediateActions, recentIncidents, recentBookings } = data
  const criticalIncidents = recentIncidents.filter(
    (i) => i.severity === 'High' || i.severity === 'Critical',
  ).length

  return (
    <div className="space-y-6">

      {/* ── Welcome banner ─────────────────────────────────────────────── */}
      <WelcomeBanner displayName={family.displayName} hasFamily />

      {/* ── Summary stats ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard index={0} label="Members"         value={counts.members}               icon={Users}         color="bg-blue-50 text-blue-600"   />
        <SummaryCard index={1} label="Accounts"        value={counts.accounts}              icon={CreditCard}    color="bg-violet-50 text-violet-600" />
        <SummaryCard index={2} label="Devices"         value={counts.devices}               icon={Smartphone}    color="bg-indigo-50 text-indigo-600" />
        <SummaryCard
          index={3}
          label="Open Incidents"
          value={criticalIncidents}
          icon={AlertTriangle}
          color={criticalIncidents > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}
        />
      </div>

      {/* ── Risk Score + Quick Actions ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <RiskScoreCard riskSummary={riskSummary} />
        <QuickActions counts={counts} />
      </div>

      {/* ── Immediate Actions + Recent Activity ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <ImmediateActions
          actions={immediateActions}
          hasAssessment={riskSummary.overallScore !== null}
        />
        <RecentActivity incidents={recentIncidents} bookings={recentBookings} />
      </div>

    </div>
  )
}

// ── Shared welcome banner ─────────────────────────────────────────────────────

function WelcomeBanner({
  displayName,
  hasFamily,
}: {
  displayName?: string
  hasFamily:    boolean
}) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-2xl bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 text-white p-6 flex flex-col sm:flex-row sm:items-center gap-4 shadow-md shadow-blue-200"
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm shrink-0">
        <ShieldCheck className="w-7 h-7 text-white" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-lg font-bold leading-snug">
          {hasFamily && displayName
            ? `Welcome back to ${displayName}`
            : displayName
            ? `Welcome back, ${displayName}`
            : 'Welcome back'}
        </p>
        <p className="text-sm text-blue-100 mt-0.5">
          {hasFamily
            ? "Here's your family's digital safety at a glance."
            : 'Set up your family profile to get started.'}
        </p>
      </div>
      {!hasFamily && (
        <button
          onClick={() => navigate('/family/new')}
          className="shrink-0 rounded-xl bg-white/20 hover:bg-white/30 transition-colors px-4 py-2.5 text-sm font-semibold backdrop-blur-sm"
        >
          Create Family →
        </button>
      )}
    </motion.div>
  )
}
