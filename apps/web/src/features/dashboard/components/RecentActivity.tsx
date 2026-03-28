import { motion } from 'framer-motion'
import { Activity, AlertTriangle, Calendar, ChevronRight, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { DashboardRecentIncident, DashboardRecentBooking } from '../dashboard.types'

// ── Severity badge colours ────────────────────────────────────────────────────

const SEVERITY_CLS: Record<string, string> = {
  Low:      'bg-slate-100 text-slate-600',
  Medium:   'bg-amber-100 text-amber-700',
  High:     'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
}

const STATUS_CLS: Record<string, string> = {
  Pending:    'bg-amber-100 text-amber-700',
  Confirmed:  'bg-blue-100 text-blue-700',
  InProgress: 'bg-indigo-100 text-indigo-700',
  Cancelled:  'bg-gray-100 text-gray-500',
  Completed:  'bg-green-100 text-green-700',
}

const fadeUp = {
  hidden:  { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: 'easeOut' as const },
  }),
}

// ── Local helpers ─────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

interface RecentActivityProps {
  incidents: DashboardRecentIncident[]
  bookings:  DashboardRecentBooking[]
}

/**
 * RecentActivity — shows recent incidents and bookings in a unified timeline.
 * Provides inline CTAs when either list is empty.
 */
export function RecentActivity({ incidents, bookings }: RecentActivityProps) {
  const navigate  = useNavigate()
  const hasItems  = incidents.length > 0 || bookings.length > 0

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-3">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <Activity className="w-4 h-4 text-gray-400" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-gray-700">Recent Activity</h2>
      </div>

      {/* Content */}
      {!hasItems ? (
        <div className="flex flex-col items-center justify-center py-10 text-center px-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
            <Info className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </div>
          <p className="text-sm text-gray-500 mb-4">
            No recent activity yet. Incidents and bookings will appear here.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/incidents/report')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              Report an incident →
            </button>
            <button
              type="button"
              onClick={() => navigate('/bookings')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Book a session →
            </button>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {/* Recent incidents */}
          {incidents.map((incident, i) => (
            <motion.li
              key={`inc-${incident.id}`}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <button
                type="button"
                onClick={() => navigate(`/incidents/result/${incident.id}`)}
                aria-label={`View incident: ${incident.summary}`}
                className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group text-left"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-50 shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-orange-500" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{incident.summary}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(incident.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-semibold', SEVERITY_CLS[incident.severity] ?? 'bg-gray-100 text-gray-600')}>
                    {incident.severity}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" aria-hidden="true" />
                </div>
              </button>
            </motion.li>
          ))}

          {/* Recent bookings */}
          {bookings.map((booking, i) => (
            <motion.li
              key={`bk-${booking.id}`}
              custom={incidents.length + i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <button
                type="button"
                onClick={() => navigate('/bookings/my')}
                aria-label={`View booking: ${booking.packageName}`}
                className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group text-left"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-blue-500" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{booking.packageName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Booked {formatDate(booking.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-semibold', STATUS_CLS[booking.status] ?? 'bg-gray-100 text-gray-600')}>
                    {booking.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" aria-hidden="true" />
                </div>
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      {/* Footer links */}
      {hasItems && (
        <div className="px-5 py-3 border-t border-gray-50 flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/incidents')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            All incidents →
          </button>
          <button
            type="button"
            onClick={() => navigate('/bookings/my')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            All bookings →
          </button>
        </div>
      )}
    </div>
  )
}
