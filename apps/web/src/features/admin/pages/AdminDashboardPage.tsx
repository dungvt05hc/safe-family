import { Link } from 'react-router-dom'
import {
  Users,
  Home,
  UserCheck,
  CalendarDays,
  AlertTriangle,
  BarChart2,
  ShieldAlert,
  Clock,
  Package,
  Activity,
} from 'lucide-react'
import { useAdminDashboard } from '../hooks/useAdminQueries'
import { AdminSpinner, AdminError } from '../components/AdminStateViews'
import { AdminStatCard } from '../components/AdminStatCard'
import { AdminRecentBookings } from '../components/AdminRecentBookings'
import { AdminRecentIncidents } from '../components/AdminRecentIncidents'

const QUICK_LINKS = [
  { label: 'Customers',       href: '/admin/customers',  icon: Users },
  { label: 'Bookings',        href: '/admin/bookings',   icon: CalendarDays },
  { label: 'Incidents',       href: '/admin/incidents',  icon: AlertTriangle },
  { label: 'Reports',         href: '/admin/reports',    icon: BarChart2 },
  { label: 'Service Packages', href: '/admin/packages', icon: Package },
  { label: 'Activity Log',    href: '/admin/activity',   icon: Activity },
]

export function AdminDashboardPage() {
  const { data, isLoading, isError } = useAdminDashboard()

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Platform overview at a glance.</p>
      </div>

      {isLoading && <AdminSpinner />}
      {isError && <AdminError message="Failed to load dashboard data. Please refresh." />}

      {data && (
        <>
          {/* ── Stat cards ─────────────────────────────────────────────────── */}
          <section aria-label="Key metrics">
            <h2 className="sr-only">Key metrics</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              <AdminStatCard
                label="Total Users"
                value={data.totalUsers}
                icon={Users}
              />
              <AdminStatCard
                label="Total Families"
                value={data.totalFamilies}
                icon={Home}
              />
              <AdminStatCard
                label="Total Members"
                value={data.totalMembers}
                icon={UserCheck}
              />
              <AdminStatCard
                label="Total Bookings"
                value={data.totalBookings}
                icon={CalendarDays}
              />
              <AdminStatCard
                label="Pending Bookings"
                value={data.pendingBookings}
                icon={Clock}
                variant={data.pendingBookings > 0 ? 'warning' : 'default'}
                sub="awaiting confirmation"
              />
              <AdminStatCard
                label="Total Incidents"
                value={data.totalIncidents}
                icon={AlertTriangle}
              />
              <AdminStatCard
                label="Open Incidents"
                value={data.openIncidents}
                icon={AlertTriangle}
                variant={data.openIncidents > 0 ? 'danger' : 'default'}
                sub="require attention"
              />
              <AdminStatCard
                label="Total Reports"
                value={data.totalReports}
                icon={BarChart2}
              />
              <AdminStatCard
                label="High‑Risk Families"
                value={data.highRiskFamilies}
                icon={ShieldAlert}
                variant={data.highRiskFamilies > 0 ? 'danger' : 'success'}
                sub="High or Critical risk level"
              />
            </div>
          </section>

          {/* ── Recent activity tables ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <AdminRecentBookings bookings={data.recentBookings} />
            <AdminRecentIncidents incidents={data.recentIncidents} />
          </div>

          {/* ── Recent audit log ────────────────────────────────────────────── */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Recent Activity</h2>
              <Link
                to="/admin/activity"
                className="text-xs font-medium text-amber-600 hover:text-amber-700 hover:underline"
              >
                View full log →
              </Link>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm" aria-label="Recent audit log">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-600">Action</th>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-600">User</th>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-600">Entity</th>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-600">Details</th>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.recentAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                        No recent activity.
                      </td>
                    </tr>
                  ) : (
                    data.recentAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-blue-700 whitespace-nowrap">
                          {log.action}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{log.userEmail ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-500">{log.entityType ?? '—'}</td>
                        <td
                          className="px-4 py-3 text-gray-500 max-w-xs truncate"
                          title={log.details ?? ''}
                        >
                          {log.details ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Quick operational links ─────────────────────────────────────── */}
          <section aria-label="Quick links">
            <h2 className="mb-3 text-base font-semibold text-gray-800">Quick Links</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  to={href}
                  className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
