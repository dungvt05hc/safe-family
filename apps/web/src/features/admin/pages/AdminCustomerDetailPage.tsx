import { useState, useRef } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Users, Smartphone, Shield, AlertTriangle, CalendarDays,
  BarChart2, StickyNote, CheckCircle, XCircle, AlertCircle, ExternalLink,
  ShieldCheck, ShieldOff, Wifi,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminSpinner, AdminError, AdminEmpty } from '../components/AdminStateViews'
import { useAdminCustomerDetail, useAddCustomerNote } from '../customers/adminCustomerDetail.hooks'
import {
  BOOKING_STATUS_COLORS, PAYMENT_STATUS_COLORS,
  INCIDENT_SEVERITY_COLORS, INCIDENT_STATUS_COLORS, INCIDENT_TYPE_LABELS,
  REPORT_TYPE_LABELS, REPORT_TYPE_COLORS,
} from '../admin.badges'
import { AdminNotesPanel } from '../notes/AdminNotesPanel'
import type {
  AdminCustomerAccountInfo,
  AdminCustomerAssessmentInfo,
  AdminCustomerBookingInfo,
  AdminCustomerChecklistSummary,
  AdminCustomerDetailResponse,
  AdminCustomerDeviceInfo,
  AdminCustomerIncidentInfo,
  AdminCustomerMemberInfo,
  AdminCustomerNoteInfo,
  AdminCustomerOwnerInfo,
  AdminCustomerReportInfo,
  RecoveryStatus,
  RiskLevel,
  SupportStatus,
  TwoFactorStatus,
} from '../customers/adminCustomerDetail.types'

// ── Shared mini-components ────────────────────────────────────────────────────

function Dash() {
  return <span className="text-gray-400" aria-label="Not available">—</span>
}

function Pill({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-semibold', className)}>
      {children}
    </span>
  )
}

const RISK_PILL: Record<RiskLevel, string> = {
  Low:      'bg-green-100 text-green-700',
  Medium:   'bg-yellow-100 text-yellow-700',
  High:     'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
}

function RiskPill({ level }: { level: RiskLevel | null }) {
  if (!level) return <Dash />
  return <Pill className={RISK_PILL[level]}>{level}</Pill>
}

function BoolIcon({ on, onLabel, offLabel }: { on: boolean; onLabel: string; offLabel: string }) {
  return on
    ? <span className="inline-flex items-center gap-1 text-green-600 text-xs"><CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />{onLabel}</span>
    : <span className="inline-flex items-center gap-1 text-gray-400 text-xs"><XCircle className="w-3.5 h-3.5" aria-hidden="true" />{offLabel}</span>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
      {children}
    </h2>
  )
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-white shadow-sm', className)}>
      {children}
    </div>
  )
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType
  title: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card>
      <div className="px-4 pt-4 pb-1">
        <SectionTitle>
          <Icon className="w-4 h-4 text-gray-400" aria-hidden="true" />
          {title}
        </SectionTitle>
      </div>
      {children}
    </Card>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

// ── Tab types ─────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'security' | 'activity' | 'notes'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',  label: 'Overview',  icon: Users },
  { id: 'security',  label: 'Security',  icon: Shield },
  { id: 'activity',  label: 'Activity',  icon: CalendarDays },
  { id: 'notes',     label: 'Notes',     icon: StickyNote },
]

// ── Sub-section: Owner ────────────────────────────────────────────────────────

function OwnerCard({ owner }: { owner: AdminCustomerOwnerInfo }) {
  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-700 text-base font-bold shrink-0"
          aria-hidden="true"
        >
          {owner.displayName.trim().charAt(0).toUpperCase() || '?'}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{owner.displayName}</p>
          <p className="text-xs text-gray-500 truncate">{owner.email}</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
        <dt className="text-gray-500">Phone</dt>
        <dd className="text-gray-900">{owner.phone ?? <Dash />}</dd>
        <dt className="text-gray-500">Status</dt>
        <dd>
          <Pill className={owner.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
            {owner.status}
          </Pill>
        </dd>
        <dt className="text-gray-500">Email verified</dt>
        <dd>
          <BoolIcon on={owner.emailVerified} onLabel="Yes" offLabel="No" />
        </dd>
        <dt className="text-gray-500">Last login</dt>
        <dd className="text-gray-600">
          {owner.lastLoginAt ? formatDateTime(owner.lastLoginAt) : <Dash />}
        </dd>
      </dl>
    </div>
  )
}

// ── Sub-section: Members table ────────────────────────────────────────────────

function MembersTable({ members }: { members: AdminCustomerMemberInfo[] }) {
  if (members.length === 0) {
    return <AdminEmpty message="No family members yet." />
  }
  return (
    <table className="w-full text-xs" aria-label="Family members">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Name</th>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Email</th>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Role</th>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Joined</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {members.map((m) => (
          <tr key={m.userId} className="hover:bg-gray-50">
            <td className="px-4 py-2 font-medium text-gray-900">{m.displayName}</td>
            <td className="px-4 py-2 text-gray-600 truncate max-w-[180px]">{m.email}</td>
            <td className="px-4 py-2">
              <Pill className={m.role === 'Owner' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}>
                {m.role}
              </Pill>
            </td>
            <td className="px-4 py-2">
              <Pill className={m.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                {m.status}
              </Pill>
            </td>
            <td className="px-4 py-2 text-gray-400">{formatDate(m.joinedAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── Sub-section: Assessment ───────────────────────────────────────────────────

const SCORE_BAR_COLOR = (score: number) =>
  score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs text-gray-600">
        <span>{label}</span>
        <span className="font-semibold">{score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          role="progressbar"
          aria-label={label}
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          className={cn('h-full rounded-full transition-all', SCORE_BAR_COLOR(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

function AssessmentCard({ assessment }: { assessment: AdminCustomerAssessmentInfo | null }) {
  if (!assessment) {
    return <AdminEmpty message="No assessment completed yet." />
  }
  return (
    <div className="px-4 pb-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{assessment.overallScore}</p>
          <p className="text-xs text-gray-400">Overall score</p>
        </div>
        <RiskPill level={assessment.riskLevel} />
      </div>
      <div className="space-y-2">
        <ScoreBar label="Account Security"    score={assessment.accountSecurityScore} />
        <ScoreBar label="Device Hygiene"      score={assessment.deviceHygieneScore} />
        <ScoreBar label="Backup & Recovery"   score={assessment.backupRecoveryScore} />
        <ScoreBar label="Privacy & Sharing"   score={assessment.privacySharingScore} />
        <ScoreBar label="Scam Readiness"      score={assessment.scamReadinessScore} />
      </div>
      <p className="text-xs text-gray-400">Completed {formatDateTime(assessment.completedAt)}</p>
    </div>
  )
}

// ── Sub-section: Checklist summary ───────────────────────────────────────────

function ChecklistSummaryCard({ summary }: { summary: AdminCustomerChecklistSummary }) {
  const items = [
    { label: 'Pending',     value: summary.pending,    className: 'bg-yellow-100 text-yellow-700' },
    { label: 'In Progress', value: summary.inProgress, className: 'bg-blue-100 text-blue-700' },
    { label: 'Completed',   value: summary.completed,  className: 'bg-green-100 text-green-700' },
    { label: 'Dismissed',   value: summary.dismissed,  className: 'bg-gray-100 text-gray-500' },
  ]
  return (
    <div className="px-4 pb-4">
      <p className="text-xs text-gray-400 mb-2">{summary.total} total items</p>
      <div className="grid grid-cols-2 gap-2">
        {items.map(({ label, value, className }) => (
          <div key={label} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
            <span className="text-xs text-gray-600">{label}</span>
            <Pill className={className}>{value}</Pill>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Sub-section: Accounts ─────────────────────────────────────────────────────

const TFA_COLORS: Record<TwoFactorStatus, string> = {
  Enabled:  'bg-green-100 text-green-700',
  Disabled: 'bg-red-100 text-red-700',
  Unknown:  'bg-gray-100 text-gray-500',
}

const RECOVERY_STATUS_META: Record<RecoveryStatus, { symbol: string; className: string; label: string }> = {
  Set:     { symbol: '✓', className: 'text-green-600', label: 'Set'     },
  NotSet:  { symbol: '✗', className: 'text-red-500',   label: 'Not set' },
  Unknown: { symbol: '?', className: 'text-gray-400',  label: 'Unknown' },
}

function RecoveryStatusIcon({ status }: { status: RecoveryStatus }) {
  const { symbol, className, label } = RECOVERY_STATUS_META[status] ?? RECOVERY_STATUS_META.Unknown
  return <span className={className} aria-label={label}>{symbol}</span>
}

function AccountsTable({ accounts }: { accounts: AdminCustomerAccountInfo[] }) {
  if (accounts.length === 0) {
    return <AdminEmpty message="No active accounts tracked." />
  }
  return (
    <table className="w-full text-xs" aria-label="Accounts">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Account</th>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Type</th>
          <th scope="col" className="px-4 py-2 text-center font-medium text-gray-600">2FA</th>
          <th scope="col" className="px-4 py-2 text-center font-medium text-gray-600">Recovery</th>
          <th scope="col" className="px-4 py-2 text-center font-medium text-gray-600">Suspicious</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {accounts.map((a) => (
          <tr key={a.accountId} className={cn('hover:bg-gray-50', a.suspiciousActivityFlag && 'bg-red-50')}>
            <td className="px-4 py-2 font-mono text-gray-700">{a.maskedIdentifier}</td>
            <td className="px-4 py-2 text-gray-600">{a.accountType}</td>
            <td className="px-4 py-2 text-center">
              <Pill className={TFA_COLORS[a.twoFactorStatus] ?? 'bg-gray-100 text-gray-500'}>
                {a.twoFactorStatus}
              </Pill>
            </td>
            <td className="px-4 py-2 text-center">
              <span
                className="inline-flex items-center gap-1"
                aria-label={`Recovery — email: ${a.recoveryEmailStatus}, phone: ${a.recoveryPhoneStatus}`}
              >
                <RecoveryStatusIcon status={a.recoveryEmailStatus} />
                <RecoveryStatusIcon status={a.recoveryPhoneStatus} />
              </span>
            </td>
            <td className="px-4 py-2 text-center">
              {a.suspiciousActivityFlag
                ? <AlertCircle className="w-3.5 h-3.5 text-red-500 mx-auto" aria-label="Suspicious activity flagged" />
                : <span className="text-gray-300 text-xs">—</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── Sub-section: Devices ──────────────────────────────────────────────────────

const SUPPORT_PILL: Record<SupportStatus, string> = {
  Supported:                'bg-green-100 text-green-700',
  EndOfLife:                'bg-red-100 text-red-700',
  NoLongerReceivingUpdates: 'bg-orange-100 text-orange-700',
  Unknown:                  'bg-gray-100 text-gray-500',
}

function DevicesTable({ devices }: { devices: AdminCustomerDeviceInfo[] }) {
  if (devices.length === 0) {
    return <AdminEmpty message="No active devices tracked." />
  }
  return (
    <table className="w-full text-xs" aria-label="Devices">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Device</th>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">OS</th>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Support</th>
          <th scope="col" className="px-4 py-2 text-center font-medium text-gray-600">Lock</th>
          <th scope="col" className="px-4 py-2 text-center font-medium text-gray-600">Biometric</th>
          <th scope="col" className="px-4 py-2 text-center font-medium text-gray-600">Backup</th>
          <th scope="col" className="px-4 py-2 text-center font-medium text-gray-600">Find</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {devices.map((d) => (
          <tr key={d.deviceId} className="hover:bg-gray-50">
            <td className="px-4 py-2">
              <p className="font-medium text-gray-900">{d.brand} {d.model}</p>
              <p className="text-gray-400">{d.deviceType}</p>
            </td>
            <td className="px-4 py-2 text-gray-600">{d.osName} {d.osVersion}</td>
            <td className="px-4 py-2">
              <Pill className={SUPPORT_PILL[d.supportStatus] ?? 'bg-gray-100 text-gray-500'}>
                {d.supportStatus === 'NoLongerReceivingUpdates' ? 'No Updates' : d.supportStatus}
              </Pill>
            </td>
            {[d.screenLockEnabled, d.biometricEnabled, d.backupEnabled, d.findMyDeviceEnabled].map((on, i) => (
              <td key={i} className="px-4 py-2 text-center">
                {on
                  ? <ShieldCheck className="w-3.5 h-3.5 text-green-500 mx-auto" aria-label="Enabled" />
                  : <ShieldOff   className="w-3.5 h-3.5 text-gray-300 mx-auto" aria-label="Disabled" />}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── Sub-section: Incidents ────────────────────────────────────────────────────

function IncidentsTable({ incidents }: { incidents: AdminCustomerIncidentInfo[] }) {
  if (incidents.length === 0) {
    return <AdminEmpty message="No incidents recorded." />
  }
  return (
    <table className="w-full text-xs" aria-label="Incidents">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Type</th>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Summary</th>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Severity</th>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Date</th>
          <th scope="col" className="px-4 py-2 sr-only">View</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {incidents.map((i) => (
          <tr key={i.incidentId} className="hover:bg-gray-50">
            <td className="px-4 py-2 text-gray-700">{INCIDENT_TYPE_LABELS[i.type] ?? i.type}</td>
            <td className="px-4 py-2 text-gray-600 max-w-[240px] truncate">{i.summary}</td>
            <td className="px-4 py-2">
              <Pill className={INCIDENT_SEVERITY_COLORS[i.severity]}>{i.severity}</Pill>
            </td>
            <td className="px-4 py-2">
              <Pill className={INCIDENT_STATUS_COLORS[i.status]}>{i.status}</Pill>
            </td>
            <td className="px-4 py-2 text-gray-400 whitespace-nowrap">{formatDate(i.createdAt)}</td>
            <td className="px-4 py-2">
              <Link
                to={`/admin/incidents`}
                className="text-amber-600 hover:text-amber-700"
                aria-label={`View incident ${i.incidentId}`}
              >
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── Sub-section: Bookings ─────────────────────────────────────────────────────

function BookingsTable({ bookings }: { bookings: AdminCustomerBookingInfo[] }) {
  if (bookings.length === 0) {
    return <AdminEmpty message="No bookings yet." />
  }
  return (
    <table className="w-full text-xs" aria-label="Bookings">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Package</th>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Scheduled</th>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Channel</th>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Payment</th>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Booked</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {bookings.map((b) => (
          <tr key={b.bookingId} className="hover:bg-gray-50">
            <td className="px-4 py-2 font-medium text-gray-900">{b.packageName}</td>
            <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{formatDateTime(b.preferredStartAt)}</td>
            <td className="px-4 py-2 text-gray-500">{b.channel}</td>
            <td className="px-4 py-2">
              <Pill className={BOOKING_STATUS_COLORS[b.status]}>{b.status}</Pill>
            </td>
            <td className="px-4 py-2">
              <Pill className={PAYMENT_STATUS_COLORS[b.paymentStatus]}>{b.paymentStatus}</Pill>
            </td>
            <td className="px-4 py-2 text-gray-400 whitespace-nowrap">{formatDate(b.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── Sub-section: Reports ──────────────────────────────────────────────────────

function ReportsTable({ reports }: { reports: AdminCustomerReportInfo[] }) {
  if (reports.length === 0) {
    return <AdminEmpty message="No reports generated." />
  }
  return (
    <table className="w-full text-xs" aria-label="Reports">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Title</th>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Type</th>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600">Generated</th>
          <th scope="col" className="px-4 py-2 text-left font-medium text-gray-600 sr-only">File</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {reports.map((r) => (
          <tr key={r.reportId} className="hover:bg-gray-50">
            <td className="px-4 py-2">
              <p className="font-medium text-gray-900 truncate max-w-[240px]">{r.title}</p>
              {r.description && (
                <p className="text-gray-400 truncate max-w-[240px]">{r.description}</p>
              )}
            </td>
            <td className="px-4 py-2">
              <Pill className={cn('border', REPORT_TYPE_COLORS[r.reportType])}>
                {REPORT_TYPE_LABELS[r.reportType]}
              </Pill>
            </td>
            <td className="px-4 py-2 text-gray-400 whitespace-nowrap">{formatDate(r.generatedAt)}</td>
            <td className="px-4 py-2">
              {r.fileUrl ? (
                <a
                  href={r.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700"
                  aria-label={`Download ${r.title}`}
                >
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              ) : (
                <span className="text-gray-300">—</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── Sub-section: Notes panel ──────────────────────────────────────────────────

function NotesPanel({
  notes,
  familyId,
}: {
  notes: AdminCustomerNoteInfo[]
  familyId: string
}) {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const addNote = useAddCustomerNote(familyId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    addNote.mutate({ content: trimmed }, {
      onSuccess: () => {
        setContent('')
        textareaRef.current?.focus()
      },
    })
  }

  return (
    <div className="space-y-4">
      {/* Add note form */}
      <form onSubmit={handleSubmit} className="space-y-2" aria-label="Add note">
        <label htmlFor="note-content" className="block text-xs font-medium text-gray-700">
          New internal note
        </label>
        <textarea
          id="note-content"
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            if (addNote.isError) addNote.reset()
          }}
          rows={3}
          maxLength={2000}
          placeholder="Write an internal note visible only to admin staff…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400
                     focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none"
        />
        <div className="flex items-center justify-between">
          {content.length > 0 && !content.trim() ? (
            <span className="text-xs text-amber-600" role="alert">Note cannot be only whitespace.</span>
          ) : (
            <span className="text-xs text-gray-400">{content.length}/2000</span>
          )}
          <button
            type="submit"
            disabled={!content.trim() || addNote.isPending}
            className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-semibold text-white
                       hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {addNote.isPending ? 'Saving…' : 'Add note'}
          </button>
        </div>
        {addNote.isError && (
          <p role="alert" className="text-xs text-red-600">Failed to save note. Please try again.</p>
        )}
      </form>

      {/* Notes list */}
      {notes.length === 0 ? (
        <p className="text-xs text-gray-400">No internal notes yet.</p>
      ) : (
        <ul className="space-y-3" aria-label="Internal notes">
          {notes.map((note) => (
            <li key={note.noteId} className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-1">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
              <p className="text-xs text-gray-400">
                {note.authorEmail} · {formatDateTime(note.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Summary stat cards ────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  highlight?: boolean
}) {
  return (
    <div className={cn('rounded-lg border bg-white shadow-sm p-4', highlight && 'border-amber-200 bg-amber-50')}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <Icon className={cn('w-4 h-4', highlight ? 'text-amber-500' : 'text-gray-300')} aria-hidden="true" />
      </div>
      <p className={cn('text-2xl font-bold mt-1', highlight ? 'text-amber-700' : 'text-gray-900')}>
        {value}
      </p>
    </div>
  )
}

// ── Tab content ───────────────────────────────────────────────────────────────

function OverviewTab({ data }: { data: AdminCustomerDetailResponse }) {
  return (
    <div className="space-y-6">
      <SectionCard icon={Users} title="Owner">
        {data.owner
          ? <OwnerCard owner={data.owner} />
          : <AdminEmpty message="No owner assigned." />}
      </SectionCard>

      <SectionCard icon={Users} title={`Members (${data.members.length})`}>
        <MembersTable members={data.members} />
      </SectionCard>
    </div>
  )
}

function SecurityTab({ data }: { data: AdminCustomerDetailResponse }) {
  return (
    <div className="space-y-6">
      <SectionCard icon={Shield} title="Latest Assessment">
        <AssessmentCard assessment={data.latestAssessment} />
      </SectionCard>

      <SectionCard icon={CheckCircle} title="Checklist Summary">
        <ChecklistSummaryCard summary={data.checklistSummary} />
      </SectionCard>

      <SectionCard icon={Wifi} title={`Accounts (${data.accounts.length})`}>
        <AccountsTable accounts={data.accounts} />
      </SectionCard>

      <SectionCard icon={Smartphone} title={`Devices (${data.devices.length})`}>
        <DevicesTable devices={data.devices} />
      </SectionCard>
    </div>
  )
}

function ActivityTab({ data }: { data: AdminCustomerDetailResponse }) {
  return (
    <div className="space-y-6">
      <SectionCard icon={AlertTriangle} title={`Incidents (${data.incidents.length})`}>
        <IncidentsTable incidents={data.incidents} />
      </SectionCard>

      <SectionCard icon={CalendarDays} title={`Bookings (${data.bookings.length})`}>
        <BookingsTable bookings={data.bookings} />
      </SectionCard>

      <SectionCard icon={BarChart2} title={`Reports (${data.reports.length})`}>
        <ReportsTable reports={data.reports} />
      </SectionCard>
    </div>
  )
}

function NotesTab({ data }: { data: AdminCustomerDetailResponse }) {
  return (
    <div className="space-y-6">
      <Card className="p-4">
        <SectionTitle>
          <StickyNote className="w-4 h-4 text-gray-400" aria-hidden="true" />
          Internal Notes ({data.notes.length})
        </SectionTitle>
        <NotesPanel notes={data.notes} familyId={data.familyId} />
      </Card>

      <Card className="p-4">
        <AdminNotesPanel familyId={data.familyId} />
      </Card>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AdminCustomerDetailPage() {
  const { familyId } = useParams<{ familyId: string }>()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const { data, isLoading, isError, refetch } = useAdminCustomerDetail(familyId ?? '')

  if (!familyId) return <Navigate to="/admin/customers" replace />

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link
        to="/admin/customers"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Customers
      </Link>

      {/* Loading / error states */}
      {isLoading ? (
        <Card>
          <AdminSpinner />
        </Card>
      ) : isError ? (
        <Card>
          <AdminError message="Failed to load customer details." onRetry={() => refetch()} />
        </Card>
      ) : data ? (
        <>
          {/* Header card */}
          <Card className="p-5">
            <div className="flex items-start gap-4 flex-wrap">
              <div
                className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 text-amber-700 text-xl font-bold shrink-0"
                aria-hidden="true"
              >
                {data.familyName.trim().charAt(0).toUpperCase() || '?'}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-gray-900">{data.familyName}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                  {data.countryCode && (
                    <span className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-600">
                      {data.countryCode}
                    </span>
                  )}
                  <span>{data.timezone}</span>
                  <span>·</span>
                  <span>Joined {formatDate(data.createdAt)}</span>
                  <span>·</span>
                  <code className="text-xs text-gray-400 font-mono">{data.familyId}</code>
                </div>
              </div>
              {/* Quick risk badge */}
              {data.latestAssessment && (
                <RiskPill level={data.latestAssessment.riskLevel} />
              )}
            </div>
          </Card>

          {/* Summary stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Members"    value={data.members.length}   icon={Users} />
            <StatCard label="Accounts"   value={data.accounts.length}  icon={Wifi} />
            <StatCard
              label="Open Incidents"
              value={data.incidents.filter((i) => i.status === 'Open').length}
              icon={AlertTriangle}
              highlight={data.incidents.some((i) => i.status === 'Open')}
            />
            <StatCard
              label="Pending Bookings"
              value={data.bookings.filter((b) => b.status === 'Submitted' || b.status === 'Paid').length}
              icon={CalendarDays}
              highlight={data.bookings.some((b) => b.status === 'Submitted' || b.status === 'Paid')}
            />
          </div>

          {/* Tab bar */}
          <div
            className="flex gap-1 border-b border-gray-200"
            role="tablist"
            aria-label="Customer detail sections"
          >
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                aria-controls={`tab-panel-${id}`}
                id={`tab-${id}`}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                  activeTab === id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                )}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
                {/* Note count badge */}
                {id === 'notes' && data.notes.length > 0 && (
                  <span className="ml-1 rounded-full bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 font-semibold">
                    {data.notes.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab panels */}
          <div
            id={`tab-panel-${activeTab}`}
            role="tabpanel"
            tabIndex={0}
            aria-labelledby={`tab-${activeTab}`}
          >
            {activeTab === 'overview'  && <OverviewTab  data={data} />}
            {activeTab === 'security'  && <SecurityTab  data={data} />}
            {activeTab === 'activity'  && <ActivityTab  data={data} />}
            {activeTab === 'notes'     && <NotesTab     data={data} />}
          </div>
        </>
      ) : null}
    </div>
  )
}
