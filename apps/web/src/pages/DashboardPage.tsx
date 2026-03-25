import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  CreditCard,
  Smartphone,
  AlertTriangle,
  ShieldCheck,
  UserPlus,
  PlusCircle,
  ClipboardList,
  Flame,
  CalendarPlus,
  Zap,
  Activity,
  Calendar,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Info,
} from 'lucide-react'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useMyFamily } from '@/features/families/hooks/useMyFamily'
import { useFamilyMembers } from '@/features/families/hooks/useFamilyMembers'
import { useAccounts } from '@/features/accounts/hooks/useAccounts'
import { useDevices } from '@/features/devices/hooks/useDevices'
import { useIncidents } from '@/features/incidents/hooks/useIncidentQueries'
import { useMyBookings } from '@/features/bookings/hooks/useBookingQueries'
import { useLatestAssessment } from '@/features/assessments/hooks/useAssessmentQueries'
import type { IncidentResult } from '@/features/incidents/incidents.types'
import type { BookingResult } from '@/features/bookings/bookings.types'
import { cn } from '@/lib/utils'

// ─── Animation helpers ────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: 'easeOut' as const },
  }),
}

// ─── Risk level helpers ───────────────────────────────────────────────────────

const RISK_CONFIG = {
  Low:      { label: 'Low Risk',      bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', pct: 20 },
  Medium:   { label: 'Medium Risk',   bar: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200',   pct: 50 },
  High:     { label: 'High Risk',     bar: 'bg-orange-500',  text: 'text-orange-700',  bg: 'bg-orange-50',   border: 'border-orange-200',  pct: 75 },
  Critical: { label: 'Critical Risk', bar: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200',     pct: 95 },
} as const

type RiskLevel = keyof typeof RISK_CONFIG

// ─── Severity badge helper ────────────────────────────────────────────────────

const SEVERITY_BADGE: Record<string, string> = {
  Low:      'bg-slate-100 text-slate-600',
  Medium:   'bg-amber-100 text-amber-700',
  High:     'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, color, index,
}: {
  label: string
  value: number | string | undefined
  icon: React.ElementType
  color: string
  index: number
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={cn('flex items-center justify-center w-11 h-11 rounded-xl shrink-0', color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">
          {value ?? <span className="text-gray-300 text-lg">—</span>}
        </p>
        <p className="text-xs font-medium text-gray-500 mt-1">{label}</p>
      </div>
    </motion.div>
  )
}

function QuickAction({
  label, icon: Icon, onClick, variant = 'default', index,
}: {
  label: string
  icon: React.ElementType
  onClick: () => void
  variant?: 'default' | 'primary' | 'danger'
  index: number
}) {
  const styles = {
    default:  'border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700',
    primary:  'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
    danger:   'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
  }
  return (
    <motion.button
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 rounded-2xl p-4 text-xs font-semibold transition-all cursor-pointer',
        styles[variant],
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-center leading-tight">{label}</span>
    </motion.button>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
        <Info className="w-5 h-5 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}

function SectionCard({ title, icon: Icon, children, className }: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn('rounded-2xl border border-gray-100 bg-white shadow-sm', className)}
    >
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <Icon className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      </div>
      {children}
    </motion.div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate()
  const { data: user }       = useCurrentUser()
  const { data: family }     = useMyFamily()
  const { data: members }    = useFamilyMembers()
  const { data: accounts }   = useAccounts()
  const { data: devices }    = useDevices()
  const { data: incidents }  = useIncidents()
  const { data: bookings }   = useMyBookings()
  const { data: assessment } = useLatestAssessment()

  const openIncidents = incidents?.filter(
    (i) => i.severity === 'High' || i.severity === 'Critical',
  ) ?? []

  const risk = assessment?.riskLevel
    ? RISK_CONFIG[assessment.riskLevel as RiskLevel]
    : null

  const recentIncidents: IncidentResult[] = [...(incidents ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)

  const recentBookings: BookingResult[] = [...(bookings ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  return (
    <div className="space-y-6">

      {/* ── Welcome banner ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="rounded-2xl bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 text-white p-6 flex flex-col sm:flex-row sm:items-center gap-4 shadow-md shadow-blue-200"
      >
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm shrink-0">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold leading-snug">
            {family
              ? `Welcome back to ${family.displayName}`
              : user
              ? `Welcome back, ${user.displayName}`
              : 'Welcome back'}
          </p>
          <p className="text-sm text-blue-100 mt-0.5">
            {family
              ? "Here's your family's digital safety at a glance."
              : 'Set up your family profile to get started.'}
          </p>
        </div>
        {!family && (
          <button
            onClick={() => navigate('/family/new')}
            className="shrink-0 rounded-xl bg-white/20 hover:bg-white/30 transition-colors px-4 py-2.5 text-sm font-semibold backdrop-blur-sm"
          >
            Create Family →
          </button>
        )}
      </motion.div>

      {/* ── Summary stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard index={0} label="Members"        value={members?.length}  icon={Users}          color="bg-blue-50 text-blue-600" />
        <StatCard index={1} label="Accounts"       value={accounts?.length} icon={CreditCard}     color="bg-violet-50 text-violet-600" />
        <StatCard index={2} label="Devices"        value={devices?.length}  icon={Smartphone}     color="bg-indigo-50 text-indigo-600" />
        <StatCard index={3} label="Open Incidents" value={openIncidents.length} icon={AlertTriangle} color={openIncidents.length > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'} />
      </div>

      {/* ── Risk Score + Quick Actions row ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Risk Score card — 2/5 wide on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35, ease: 'easeOut' }}
          className={cn(
            'lg:col-span-2 rounded-2xl border p-5 shadow-sm',
            risk ? `${risk.bg} ${risk.border}` : 'border-gray-100 bg-white',
          )}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Family Risk Score
              </p>
              {assessment ? (
                <p className={cn('text-4xl font-black', risk?.text ?? 'text-gray-900')}>
                  {assessment.overallScore}
                  <span className="text-lg font-medium text-gray-400 ml-1">/100</span>
                </p>
              ) : (
                <p className="text-3xl font-bold text-gray-300">—</p>
              )}
            </div>
            <div className={cn(
              'flex items-center justify-center w-10 h-10 rounded-xl',
              risk ? `${risk.bar.replace('bg-', 'bg-').replace('-500', '-100').replace('-400', '-100')} ` : 'bg-gray-100',
            )}>
              <TrendingUp className={cn('w-5 h-5', risk?.text ?? 'text-gray-400')} />
            </div>
          </div>

          {assessment && risk ? (
            <>
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-black/10 overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${risk.pct}%` }}
                  transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
                  className={cn('h-full rounded-full', risk.bar)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className={cn('text-sm font-semibold', risk.text)}>{risk.label}</span>
                <button
                  onClick={() => navigate('/assessment')}
                  className={cn(
                    'text-xs font-medium underline underline-offset-2 transition-opacity hover:opacity-70',
                    risk.text,
                  )}
                >
                  Re-run check →
                </button>
              </div>
            </>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-3">No assessment yet. Run a risk check to see your score.</p>
              <button
                onClick={() => navigate('/assessment')}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Run Risk Check →
              </button>
            </div>
          )}
        </motion.div>

        {/* Quick Actions — 3/5 wide on desktop */}
        <div className="lg:col-span-3 rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            <QuickAction index={0} label="Add Member"       icon={UserPlus}     variant="default" onClick={() => navigate('/family/members')} />
            <QuickAction index={1} label="Add Account"      icon={PlusCircle}   variant="default" onClick={() => navigate('/accounts')} />
            <QuickAction index={2} label="Run Risk Check"   icon={ClipboardList} variant="primary" onClick={() => navigate('/assessment')} />
            <QuickAction index={3} label="Report Incident"  icon={Flame}        variant="danger"  onClick={() => navigate('/incidents/report')} />
            <QuickAction index={4} label="Book Support"     icon={CalendarPlus} variant="default" onClick={() => navigate('/bookings')} />
          </div>
        </div>
      </div>

      {/* ── Immediate Actions + Recent Activity ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Immediate Actions — 2/5 */}
        <SectionCard title="Immediate Actions" icon={Flame} className="lg:col-span-2">
          {assessment?.immediateActions && assessment.immediateActions.length > 0 ? (
            <ul className="divide-y divide-gray-50">
              {assessment.immediateActions.slice(0, 3).map((action, i) => (
                <motion.li
                  key={i}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="mt-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 shrink-0">
                    <span className="text-orange-600 text-[10px] font-bold">{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-snug">{action}</p>
                </motion.li>
              ))}
            </ul>
          ) : (
            <EmptyState message={assessment ? 'No immediate actions — great job!' : 'Run a risk assessment to get personalised action items.'} />
          )}
          {assessment && (
            <div className="px-5 py-3 border-t border-gray-50">
              <button
                onClick={() => navigate('/assessment')}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                View full assessment
              </button>
            </div>
          )}
        </SectionCard>

        {/* Recent Activity — 3/5 */}
        <SectionCard title="Recent Activity" icon={Activity} className="lg:col-span-3">
          {recentIncidents.length === 0 && recentBookings.length === 0 ? (
            <EmptyState message="No recent activity yet. Incidents and bookings will appear here." />
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentIncidents.map((incident, i) => (
                <motion.li
                  key={`inc-${incident.id}`}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/incidents/result/${incident.id}`)}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-50 shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{incident.summary}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(incident.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-semibold', SEVERITY_BADGE[incident.severity])}>
                      {incident.severity}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </motion.li>
              ))}
              {recentBookings.map((booking, i) => (
                <motion.li
                  key={`bk-${booking.id}`}
                  custom={recentIncidents.length + i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => navigate('/bookings/my')}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{booking.packageName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Booked {new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">
                      {booking.channel}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
          {(recentIncidents.length > 0 || recentBookings.length > 0) && (
            <div className="px-5 py-3 border-t border-gray-50 flex gap-4">
              <button
                onClick={() => navigate('/incidents')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                All incidents →
              </button>
              <button
                onClick={() => navigate('/bookings/my')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                All bookings →
              </button>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
