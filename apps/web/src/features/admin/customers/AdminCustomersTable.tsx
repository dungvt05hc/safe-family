import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AdminCustomerRow, RiskLevel } from './adminCustomers.types'

interface Props {
  customers: AdminCustomerRow[]
}

// ── Inline cell helpers ───────────────────────────────────────────────────────

function Dash() {
  return <span className="text-gray-400" aria-label="Not available">—</span>
}

const riskPillClass: Record<RiskLevel, string> = {
  Low:      'bg-green-100 text-green-700',
  Medium:   'bg-yellow-100 text-yellow-700',
  High:     'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
}

function RiskBadge({ level }: { level: RiskLevel | null }) {
  if (!level) return <Dash />
  return (
    <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-semibold', riskPillClass[level])}>
      {level}
    </span>
  )
}

const countPillClass = {
  red:   'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-700',
}

function CountBadge({ count, color }: { count: number; color: 'red' | 'amber' }) {
  if (count === 0) return <Dash />
  return (
    <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-semibold', countPillClass[color])}>
      {count}
    </span>
  )
}

// ── Table ─────────────────────────────────────────────────────────────────────

export function AdminCustomersTable({ customers }: Props) {
  return (
    <table className="w-full text-sm" aria-label="Customers">
      <thead className="bg-gray-50 text-left">
        <tr>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Family</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Owner</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600 text-center">Members</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Risk Level</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600 text-center">Open Incidents</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600 text-center">Pending Bookings</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Latest Plan</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Joined</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600 sr-only">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {customers.map((row) => (
          <tr key={row.familyId} className="hover:bg-gray-50">
            {/* Family */}
            <td className="px-4 py-3">
              <span className="font-medium text-gray-900">{row.familyName}</span>
              {row.countryCode && (
                <span className="ml-2 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 font-mono">
                  {row.countryCode}
                </span>
              )}
            </td>

            {/* Owner */}
            <td className="px-4 py-3">
              <div className="text-gray-800">{row.ownerDisplayName ?? row.ownerEmail ?? <Dash />}</div>
              {row.ownerEmail && row.ownerDisplayName && (
                <div className="text-xs text-gray-400 mt-0.5">{row.ownerEmail}</div>
              )}
              {row.ownerPhone && (
                <div className="text-xs text-gray-400 mt-0.5">{row.ownerPhone}</div>
              )}
            </td>

            {/* Members */}
            <td className="px-4 py-3 text-center text-gray-600">{row.memberCount}</td>

            {/* Risk Level */}
            <td className="px-4 py-3"><RiskBadge level={row.latestRiskLevel} /></td>

            {/* Open Incidents */}
            <td className="px-4 py-3 text-center">
              <CountBadge count={row.openIncidentCount} color="red" />
            </td>

            {/* Pending Bookings */}
            <td className="px-4 py-3 text-center">
              <CountBadge count={row.pendingBookingCount} color="amber" />
            </td>

            {/* Latest Plan */}
            <td className="px-4 py-3 text-gray-600">
              {row.latestPlanType ?? <Dash />}
            </td>

            {/* Joined */}
            <td className="px-4 py-3 text-gray-400">
              {new Date(row.createdAt).toLocaleDateString()}
            </td>

            {/* Actions */}
            <td className="px-4 py-3">
              <Link
                to={`/admin/customers/${row.familyId}`}
                className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium"
                aria-label={`View ${row.familyName}`}
              >
                View <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
